import { useEffect } from "react";
import { useLocation } from "react-router";

/** Scrolls to the element named by the URL's #anchor. react-router doesn't do it itself (e.g. the footer's "Credits" link). */
export const useHashScroll = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);
};
