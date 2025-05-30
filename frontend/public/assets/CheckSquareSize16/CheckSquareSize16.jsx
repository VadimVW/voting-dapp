import "./CheckSquareSize16.css";

export const CheckSquareSize16 = ({ size = "48", className, ...props }) => {
  const variantsClassName = "size-" + size;

  return (
    <svg
      className={"check-square-size-16 " + className + " " + variantsClassName}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 7.33333L8 9.33333L14.6667 2.66667M14 8V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H10.6667"
        stroke="#F5F5F5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
