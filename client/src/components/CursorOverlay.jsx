import { useEffect, useState } from "react";

const CursorOverlay = ({ cursors }) => {
  return (
    <div className="cursor-overlay">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-6px, -6px)",
          }}
        >
          <div
            className="cursor-dot"
            style={{
              backgroundColor: cursor.color,
              boxShadow: `0 0 0 2px white, 0 0 0 3px ${cursor.color}`,
            }}
          />
          <div
            className="cursor-label"
            style={{
              backgroundColor: cursor.color,
            }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorOverlay;
