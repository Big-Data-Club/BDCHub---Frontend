"use client";

import Image, { ImageProps } from "next/image";
import { LogoIcon } from "@/constants";

function isValidSrc(src?: string) {
  if (!src) return false;
  return src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://");
}

export default function SafeImage(props: ImageProps) {
  const { src, alt, ...rest } = props;

  const safeSrc = isValidSrc(String(src))
    ? src
    : LogoIcon;

  return <Image {...rest} src={safeSrc} alt={alt}/>;
}