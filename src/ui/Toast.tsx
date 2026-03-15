import { useEffect, useState } from "react";

export function Toast(props: { message: string; onDone: () => void; ms?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 10);
    const hide = window.setTimeout(() => setVisible(false), Math.max(800, props.ms ?? 1800));
    const done = window.setTimeout(() => props.onDone(), Math.max(980, (props.ms ?? 1800) + 220));
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
      window.clearTimeout(done);
    };
  }, [props]);

  return <div className={"toast " + (visible ? "toastShow" : "toastHide")}>{props.message}</div>;
}

