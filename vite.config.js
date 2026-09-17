import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "StellarPaymentUI",
      fileName: (format) => `stellar-payment-ui.${format === "es" ? "es" : "cjs"}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
    cssCodeSplit: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
