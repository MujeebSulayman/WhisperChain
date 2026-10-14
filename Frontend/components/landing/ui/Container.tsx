import type { ReactNode } from "react";

type ContainerProps = {
  /** Classes for the inner flex row (e.g. `justify-center`). */
  rowClassName?: string;
  /** Classes for the column wrapping the content (e.g. `xl:w-9/12`). */
  colClassName?: string;
  children: ReactNode;
};

export function Container({ rowClassName = "", colClassName = "", children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
      <div className={`flex flex-wrap ${rowClassName}`}>
        <div className={`w-full ${colClassName}`}>{children}</div>
      </div>
    </div>
  );
}
