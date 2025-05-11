import "./XSize16.css";

export const XSize16 = ({ size = "48", className, ...props }) => {
  const variantsClassName = "size-" + size;

  return (
    <svg
      className={"x-size-16 " + className + " " + variantsClassName}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="#1E1E1E"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
