import * as React from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import useEmblaCarousel from "embla-carousel-react";

export type InlineCitationProps = React.ComponentProps<"span">;

/**
 * Root container for inline citations
 */
export function InlineCitation({ className, ...props }: InlineCitationProps) {
  return <span className={className} {...props} />;
}

export type InlineCitationTextProps = React.ComponentProps<"span">;

/**
 * The text being cited
 */
export function InlineCitationText({ className, ...props }: InlineCitationTextProps) {
  return <span className={className} {...props} />;
}

export type InlineCitationCardProps = React.ComponentProps<typeof HoverCard.Root>;

/**
 * Hover card container for citation details
 */
export function InlineCitationCard(props: InlineCitationCardProps) {
  return <HoverCard.Root closeDelay={0} openDelay={0} {...props} />;
}

export type InlineCitationCardTriggerProps = React.ComponentProps<"button"> & {
  /** Array of source URLs */
  sources: string[];
};

/**
 * Badge/trigger that opens the citation card
 */
export function InlineCitationCardTrigger({
  sources,
  className,
  children,
  ...props
}: InlineCitationCardTriggerProps) {
  const displayText = sources.length
    ? `${getHostname(sources[0])}${sources.length > 1 ? ` +${sources.length - 1}` : ""}`
    : "unknown";

  return (
    <HoverCard.Trigger asChild>
      <button className={className} type="button" {...props}>
        {children ?? displayText}
      </button>
    </HoverCard.Trigger>
  );
}

export type InlineCitationCardBodyProps = React.ComponentProps<typeof HoverCard.Content>;

/**
 * Content body of the citation card
 */
export function InlineCitationCardBody({ className, ...props }: InlineCitationCardBodyProps) {
  return (
    <HoverCard.Portal>
      <HoverCard.Content className={className} {...props} />
    </HoverCard.Portal>
  );
}

type CarouselApi = ReturnType<typeof useEmblaCarousel>[1];
const CarouselApiContext = React.createContext<CarouselApi>(undefined);

export type InlineCitationCarouselProps = React.ComponentProps<"div">;

/**
 * Carousel container for multiple citations
 */
export function InlineCitationCarousel({ className, children, ...props }: InlineCitationCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  return (
    <CarouselApiContext.Provider value={emblaApi}>
      <div className={className} {...props}>
        <div ref={emblaRef} style={{ overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </CarouselApiContext.Provider>
  );
}

export type InlineCitationCarouselContentProps = React.ComponentProps<"div">;

/**
 * Container for carousel items
 */
export function InlineCitationCarouselContent({ className, ...props }: InlineCitationCarouselContentProps) {
  return <div className={className} style={{ display: "flex" }} {...props} />;
}

export type InlineCitationCarouselItemProps = React.ComponentProps<"div">;

/**
 * Individual carousel item
 */
export function InlineCitationCarouselItem({ className, ...props }: InlineCitationCarouselItemProps) {
  return <div className={className} style={{ flex: "0 0 100%", minWidth: 0 }} {...props} />;
}

export type InlineCitationCarouselHeaderProps = React.ComponentProps<"div">;

/**
 * Header for carousel navigation
 */
export function InlineCitationCarouselHeader({ className, ...props }: InlineCitationCarouselHeaderProps) {
  return <div className={className} {...props} />;
}

export type InlineCitationCarouselIndexProps = React.ComponentProps<"div">;

/**
 * Current slide index display (e.g., "1/3")
 */
export function InlineCitationCarouselIndex({ children, className, ...props }: InlineCitationCarouselIndexProps) {
  const emblaApi = React.useContext(CarouselApiContext);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateState = () => {
      setCurrent(emblaApi.selectedScrollSnap() + 1);
      setCount(emblaApi.scrollSnapList().length);
    };

    updateState();
    emblaApi.on("select", updateState);
    emblaApi.on("reInit", updateState);

    return () => {
      emblaApi.off("select", updateState);
      emblaApi.off("reInit", updateState);
    };
  }, [emblaApi]);

  return (
    <div className={className} {...props}>
      {children ?? `${current}/${count}`}
    </div>
  );
}

export type InlineCitationCarouselPrevProps = React.ComponentProps<"button">;

/**
 * Previous slide button
 */
export function InlineCitationCarouselPrev({ className, children, ...props }: InlineCitationCarouselPrevProps) {
  const emblaApi = React.useContext(CarouselApiContext);

  return (
    <button
      type="button"
      className={className}
      onClick={() => emblaApi?.scrollPrev()}
      disabled={!emblaApi}
      aria-label="Previous citation"
      {...props}
    >
      {children ?? "←"}
    </button>
  );
}

export type InlineCitationCarouselNextProps = React.ComponentProps<"button">;

/**
 * Next slide button
 */
export function InlineCitationCarouselNext({ className, children, ...props }: InlineCitationCarouselNextProps) {
  const emblaApi = React.useContext(CarouselApiContext);

  return (
    <button
      type="button"
      className={className}
      onClick={() => emblaApi?.scrollNext()}
      disabled={!emblaApi}
      aria-label="Next citation"
      {...props}
    >
      {children ?? "→"}
    </button>
  );
}

export type InlineCitationSourceProps = React.ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

/**
 * Source information display
 */
export function InlineCitationSource({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) {
  return (
    <div className={className} {...props}>
      {title && <h4>{title}</h4>}
      {url && <p>{url}</p>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export type InlineCitationQuoteProps = React.ComponentProps<"blockquote">;

/**
 * Blockquote for cited text
 */
export function InlineCitationQuote({ children, className, ...props }: InlineCitationQuoteProps) {
  return (
    <blockquote className={className} {...props}>
      {children}
    </blockquote>
  );
}

// Helper function
function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default InlineCitation;
