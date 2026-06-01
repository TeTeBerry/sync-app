import { cn } from './cn';

/** Build a BEM element class: `block__element` + optional `--modifier` suffixes. */
export function bem(
  block: string,
  element: string,
  modifiers?: Array<string | false | null | undefined>,
): string {
  const base = `${block}__${element}`;
  const modClasses = (modifiers ?? []).filter(Boolean).map((m) => `${base}--${m}`);
  return cn(base, ...modClasses);
}
