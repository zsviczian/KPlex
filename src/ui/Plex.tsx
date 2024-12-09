import React, { useState } from "react";

const Plex = () => {
  const [isClicked, setIsClicked] = useState(false); // Track if the button is clicked
  const [isHovered, setIsHovered] = useState(false); // Track if the button is hovered

  const handleClick = () => {
    setIsClicked(true); // Change the color when clicked
  };

  const handleMouseEnter = () => {
    setIsHovered(true); // Show the hover message
  };

  const handleMouseLeave = () => {
    setIsHovered(false); // Hide the hover message
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#2b3a42", // Dark gray-blue background
        margin: 0,
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          backgroundColor: isClicked ? "#1f2a30" : "#34495e", // Darker color if clicked
          borderRadius: "15px",
          border: "2px solid white",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s ease", // Smooth background transition
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isHovered ? "Hi" : "Hello World"}
      </div>
    </div>
  );
};

export default Plex;
