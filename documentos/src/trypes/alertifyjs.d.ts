declare module 'alertifyjs' {
    export function alert(title: string, message: string, callback?: () => void): void;
    export function confirm(title: string, message: string, okCallback?: () => void, cancelCallback?: () => void): void;
    export function success(message: string): void;
    export function error(message: string): void;
    export function message(message: string): void;
    // Add more declarations as needed based on the functions you use
  }
  