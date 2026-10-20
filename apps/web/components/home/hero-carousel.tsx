"use client";

import type { ReactNode } from "react";
import { Carousel } from "@studionomade/ui";

/**
 * Frontera de cliente del hero: `Carousel` recibe `slideLabel` como función y
 * una función no puede cruzar de un Server Component a uno de cliente. Las
 * diapositivas siguen renderizándose en el servidor (llegan como `children`).
 */
export function HeroCarousel({
  titles,
  autoplay,
  className,
  children
}: {
  titles: string[];
  autoplay: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Carousel
      className={className}
      label="Proyectos destacados"
      variant="full"
      loop
      invert
      autoplay={autoplay}
      prevLabel="Proyecto anterior"
      nextLabel="Proyecto siguiente"
      pauseLabel="Pausar"
      playLabel="Reanudar"
      slideLabel={(index, total) => `${titles[index] ?? "Proyecto"}, ${index + 1} de ${total}`}
    >
      {children}
    </Carousel>
  );
}
