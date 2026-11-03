import type { Metadata } from "next";
import NotFound from "next/dist/client/components/builtin/not-found";

// Next's own 404 page. Next 15 lets the layout's title win over the one that page sets for itself,
// so a missing address would otherwise show the homepage's title in the browser tab.
export const metadata: Metadata = {
  title: "404: This page could not be found.",
};

export default NotFound;
