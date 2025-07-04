import { useEffect } from "react";

const styles = `
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  /* Estilos adicionales para consistencia con Hero UI */
  .text-default-500 {
    color: #71717a;
  }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .dark .text-default-500 {
    color: #d4d4d8;
  }
`;

const GlobalStyles = () => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return null;
};

export default GlobalStyles;