"use client";

import React from "react";

export default function OceanBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ocean-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: -1;
          background: radial-gradient(ellipse at center, rgba(255,254,234,1) 0%, rgba(255,254,234,1) 35%, #B7E8EB 100%);
        }
        
        .ocean { 
          height: 5%;
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          background: #015871;
        }
        
        .ocean-wave {
          background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg) repeat-x; 
          position: absolute;
          top: -198px;
          width: 6400px;
          height: 198px;
          animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) infinite;
          transform: translate3d(0, 0, 0);
        }
        
        .ocean-wave:nth-of-type(2) {
          top: -175px;
          animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 7s ease -1.25s infinite;
          opacity: 1;
        }
        
        @keyframes wave {
          0% {
            margin-left: 0;
          }
          100% {
            margin-left: -1600px;
          }
        }
        
        @keyframes swell {
          0%, 100% {
            transform: translate3d(0,-25px,0);
          }
          50% {
            transform: translate3d(0,5px,0);
          }
        }
      `}} />
      <div className="ocean-container pointer-events-none">
        <div className="ocean">
          <div className="ocean-wave"></div>
          <div className="ocean-wave"></div>
        </div>
      </div>
    </>
  );
}
