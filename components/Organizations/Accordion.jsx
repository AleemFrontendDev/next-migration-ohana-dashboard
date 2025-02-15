import React, { useState } from "react";

const CustomAccordion = ({ header, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="custom-accordion card-body">
      <div onClick={toggleAccordion} className="w-100 cursor-pointer">
        {header}
      </div>
      {isOpen && <div className="accordion-collapse">{children}</div>}
    </div>
  );
};

export default CustomAccordion;
