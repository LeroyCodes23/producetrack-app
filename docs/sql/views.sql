-- ================================================================
-- ProduceTrack SQL Views
-- Database: ProduceTrack (LIVE server: CITRUSLIVE)
-- ================================================================
-- These views are the source of truth for the app's data reads.
-- Cross-database views read from:
--   - PaltrackRF.dbo.pp_bin_register
--   - GHS_FwApps.dbo.GHM_QX_PSS
--   - GHSSAPSTAGING.dbo.SAPCLIENTACCOUNTS
--   - GHC_SBO.dbo.[@BK_FARMSLINES], [@BK_FARMS], [@BK_ORCHARDS],
--                  [@VARIETY], [@SD_SYSTEM_KEYS]
--
-- Permissions:
--   GRANT SELECT ON <view> TO [Ptrack_admin]
-- ================================================================


-- ================================================================
-- 1. vBinRegister
--    Aggregated bin data per Orchard/Packhouse/Cultivar/Variety/Run
--    Used by: /api/bin-register
-- ================================================================
IF OBJECT_ID('dbo.vBinRegister', 'V') IS NOT NULL
    DROP VIEW dbo.vBinRegister;
GO

CREATE VIEW [dbo].[vBinRegister]
AS
SELECT
    CLIENT,
    SEASON,
    CASE
        WHEN ORCHARD IS NULL OR LTRIM(RTRIM(ORCHARD)) = '' THEN 'Unknown'
        ELSE RTRIM(LTRIM(ORCHARD))
    END                     AS [Orchard],
    RTRIM(LTRIM(PACKHOUSE)) AS [PACKHOUSE],
    RTRIM(LTRIM(VAR_GRP))   AS [Cultivar],
    RTRIM(LTRIM(VARIETY))   AS [Variety],
    COUNT(*)                AS [Bins],
    SUM(IN_WEIGHT)          AS [BinsKG],
    MAX(IN_DATE_TIME)       AS [RunDate],
    RUN_NUMBER              AS [RunPackhouse]
FROM PaltrackRF.dbo.pp_bin_register
GROUP BY
    CLIENT, SEASON, ORCHARD, PACKHOUSE, VAR_GRP, VARIETY, RUN_NUMBER;
GO

GRANT SELECT ON [dbo].[vBinRegister] TO [Ptrack_admin];
GO


-- ================================================================
-- 2. vBinRegisterDetail
--    Individual bin rows with all displayable columns
--    Used by: /api/bin-register/detail and /api/bin-register/[binNumber]
-- ================================================================
IF OBJECT_ID('dbo.vBinRegisterDetail', 'V') IS NOT NULL
    DROP VIEW dbo.vBinRegisterDetail;
GO

CREATE VIEW [dbo].[vBinRegisterDetail]
AS
SELECT
    RTRIM(LTRIM(BINNUMBER))       AS [BINNUMBER],
    SEASON,
    CLIENT,
    RTRIM(LTRIM(ORCHARD))         AS [ORCHARD],
    RTRIM(LTRIM(PACKHOUSE))       AS [PACKHOUSE],
    RTRIM(LTRIM(POOL))            AS [POOL],
    RTRIM(LTRIM(STOCK_POOL))      AS [STOCK_POOL],
    RTRIM(LTRIM(SUB_POOL))        AS [SUB_POOL],
    RTRIM(LTRIM(COMMODITY))       AS [COMMODITY],
    RTRIM(LTRIM(VAR_GRP))         AS [Cultivar],
    RTRIM(LTRIM(VARIETY))         AS [VARIETY],
    IN_TYPE,
    IN_NUMBER,
    IN_DATE_TIME,
    IN_WEIGHT,
    SALE_NUMBER,
    RUN_NUMBER,
    OUT_DATE_TIME,
    OUT_WEIGHT,
    RTRIM(LTRIM(DEGREENING_ROOM)) AS [DEGREENING_ROOM],
    RTRIM(LTRIM(GRADE))           AS [GRADE],
    SIZE_COUNT,
    DEGREEN_START,
    DEGREEN_DURATION,
    TRANS_DATE_TIME,
    TRANS_USER,
    PROCESSED,
    RTRIM(LTRIM(BIN_TYPE))        AS [BIN_TYPE],
    RTRIM(LTRIM(BIN_BRAND))       AS [BIN_BRAND],
    GPS_LAT,
    GPS_LONG
FROM PaltrackRF.dbo.pp_bin_register;
GO

GRANT SELECT ON [dbo].[vBinRegisterDetail] TO [Ptrack_admin];
GO


-- ================================================================
-- 3. vCurrentSensus
--    Orchard/sensus aggregated data with bearing hectares
--    Used by: /api/sensus-data
-- ================================================================
IF OBJECT_ID('dbo.vCurrentSensus', 'V') IS NOT NULL
    DROP VIEW dbo.vCurrentSensus;
GO

CREATE VIEW [dbo].[vCurrentSensus]
AS
SELECT
    sca.CLIENTNUMBER                                              AS [FatherCard],
    sca.ACCOUNTNUMBER                                             AS [CardCode],
    sca.ACCOUNTNAME                                               AS [CardName],
    FL.U_FarmName                                                 AS [FarmName],
    ISNULL(O.U_Orchard, '')                                       AS [Orchard],
    CASE WHEN LEFT(O.U_ItemCode, 2) IN ('NV', 'VL') THEN 'OR'
         ELSE ISNULL(LEFT(O.U_ItemCode, 2), '') END               AS [Commodity],
    ISNULL(LEFT(O.U_ItemCode, 2), '')                             AS [Cultivar],
    ISNULL(RIGHT(O.U_ItemCode, 3), '')                            AS [Variety],
    ISNULL(O.U_PUCNo, '')                                         AS [PUC],
    ISNULL(O.U_BigStatus, 'No')                                   AS [BigStatus],
    ISNULL(O.U_YearPlnt, 0)                                       AS [YearPlnt],
    ISNULL(O.U_OndrStam, '')                                      AS [OnderStam],
    DATEPART(yyyy, GETDATE()) - ISNULL(O.U_YearPlnt, DATEPART(yyyy, GETDATE())) AS [Age],
    ISNULL(CONVERT(numeric(18,2), O.U_TrWidth), 0)                AS [TreeWidth],
    ISNULL(CONVERT(numeric(18,2), O.U_RowWidth), 0)               AS [RowWidth],
    ISNULL(O.U_TreeCnt, 0)                                        AS [TreeCount],
    CASE
        WHEN ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars)
        ELSE CONVERT(numeric(18,2),
             ISNULL((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000, 0))
    END                                                           AS [Ha],
    CASE
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) > 10 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_Great10 / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 10 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_10Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 9 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_9Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 8 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_8Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 7 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_7Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 6 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_6Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 5 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_5Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 4 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_4Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 3 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_3Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 2 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_2Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 1 AND ISNULL(O.U_Hectars, 0) > 0
            THEN CONVERT(numeric(18,2), O.U_Hectars * V.U_1Years / 100)

        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) > 10 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_Great10 / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 10 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_10Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 9 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_9Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 8 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_8Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 7 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_7Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 6 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_6Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 5 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_5Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 4 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_4Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 3 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_3Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 2 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_2Years / 100)
        WHEN (DATEPART(yyyy, GETDATE()) - O.U_YearPlnt) = 1 AND ISNULL(O.U_Hectars, 0) = 0
            THEN CONVERT(numeric(18,2), ((O.U_TrWidth * O.U_RowWidth * O.U_TreeCnt) / 10000) * V.U_1Years / 100)
        ELSE 0
    END                                                           AS [HaBearing]
FROM GHSSAPSTAGING.dbo.SAPCLIENTACCOUNTS sca
LEFT JOIN GHC_SBO.dbo.[@BK_FARMSLINES] FL
    ON FL.U_CardCode COLLATE Latin1_General_CI_AS = sca.ACCOUNTNUMBER
LEFT JOIN GHC_SBO.dbo.[@BK_FARMS] FH
    ON FL.DocEntry = FH.DocEntry
LEFT JOIN GHC_SBO.dbo.[@BK_ORCHARDS] O
    ON FL.U_FarmCode = O.U_Farm
   AND O.U_Season = FH.U_Season
LEFT JOIN GHC_SBO.dbo.[@VARIETY] V
    ON RIGHT(O.U_ItemCode, 3) = V.Code
WHERE FH.U_Season IN (
        SELECT U_Value
        FROM ghc_sbo.dbo.[@SD_SYSTEM_KEYS]
        WHERE Name = 'CurrentSeason'
      )
  AND sca.CONTRACT_TERM <> 'O';
GO

GRANT SELECT ON [dbo].[vCurrentSensus] TO [Ptrack_admin];
GO


-- ================================================================
-- 4. vSolasCurrentSeason
--    Solas Kg per target market/region/country for current season
--    Used by: /api/market-distribution
-- ================================================================
IF OBJECT_ID('dbo.vSolasCurrentSeason', 'V') IS NOT NULL
    DROP VIEW dbo.vSolasCurrentSeason;
GO

CREATE VIEW [dbo].[vSolasCurrentSeason]
AS
SELECT
    [Farm Number],
    [Solas Kg],
    Season,
    [Target Market],
    [Target Region],
    [Target Country]
FROM GHS_FwApps.dbo.GHM_QX_PSS
WHERE Season = (
    SELECT MAX(Season)
    FROM GHS_FwApps.dbo.GHM_QX_PSS
);
GO

GRANT SELECT ON [dbo].[vSolasCurrentSeason] TO [Ptrack_admin];
GO


-- ================================================================
-- END OF FILE
-- ================================================================
