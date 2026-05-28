import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, style, onChange, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const ref = (forwardedRef as any) || innerRef;

    const resize = () => {
      const el = (ref as any).current as HTMLTextAreaElement | null;
      if (!el) return;
      el.style.height = "auto";
      // add 2px to avoid scrollbar in some browsers
      el.style.height = `${el.scrollHeight + 2}px`;
    };

    React.useLayoutEffect(() => {
      resize();
    }, [props.value]);

    React.useEffect(() => {
      const el = (ref as any).current as HTMLTextAreaElement | null;
      if (!el) return;
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      if (onChange) onChange(e);
      // resize after change
      requestAnimationFrame(resize);
    };

    return (
      <textarea
        className={cn(
          "w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        style={{ overflow: "hidden", resize: "none", ...(style as React.CSSProperties) }}
        onChange={handleChange}
        {...(props as any)}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
