import "./ButtonVariantPrimaryStateDefaultSizeSmall.css";
import { XSize16 } from "../XSize16/XSize16.jsx";
import { StarSize162 } from "../StarSize162/StarSize162.jsx";
import { StarSize16 } from "../StarSize16/StarSize16.jsx";

export const ButtonVariantPrimaryStateDefaultSizeSmall = ({
  label = "Button",
  iconEnd = <XSize16 className="x-instance" size="16" />,
  hasIconEnd = false,
  hasIconStart = false,
  iconStart = <StarSize162 className="star-instance" size="16" />,
  variant = "primary",
  state = "default",
  size = "medium",
  className,
  ...props
}) => {
const variantsClassName =
  "variant-" + variant + " state-" + state + " size-" + size;
    return (
    <button
      type="button"
      className={[
        "button-variant-primary-state-default-size-small",
        variantsClassName,
        className,
        props.disabled ? "disabled" : ""
      ].filter(Boolean).join(" ")}
    onClick={props.onClick}
    disabled={props.disabled}
    {...props}
    >
      {hasIconStart && iconStart}
      <span className="button-label">{label}</span>
      {hasIconEnd && iconEnd}
    </button>
 );
};
