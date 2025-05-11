import "./StarSize16.css";

export const StarSize16 = ({ size = "48", className, ...props }) => {
  const variantsClassName = "size-" + size;

  return (
    <svg
      className={"star-size-16 " + className + " " + variantsClassName}
      width="16"
      height="16"
    ></svg>
  );
};
