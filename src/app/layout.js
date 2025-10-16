import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";

export const metadata = {
  title: "Training Den",
  description: "A Compliance Training Tracking Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
