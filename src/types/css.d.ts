// src/types/css.d.ts

// Side-effect CSS imports (e.g. `import './globals.css'`)
declare module '*.css';

// CSS Modules (e.g. `import styles from './style.module.css'`)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}