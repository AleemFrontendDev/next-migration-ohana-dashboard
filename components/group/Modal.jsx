import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const contentStyle = {
  backgroundColor: "#ffaf00",
  padding: "10px",
  borderRadius: "1rem",
  position: "relative",
  maxWidth: "600px",
  width: "90%",
};


const Modal = ({ show, onHide, children }) => {
  if (!show) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={overlayStyle} onClick={onHide}>
      <div style={contentStyle} onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
