// @flow
import React from 'react';

export function AddButtonSVG() {
  return (
    <svg
      id="add-button-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 130</title>
      <path
        className="add-button-svg"
        d="M29.25,8h-4.5a1.5,1.5,0,0,0-1.5,1.5V23.25H9.49A1.5,1.5,0,0,0,8,24.75v4.5a1.51,1.51,0,0,0,1.5,1.5H23.25V44.51a1.5,1.5,0,0,0,1.5,1.5h4.5a1.51,1.51,0,0,0,1.5-1.5V30.75H44.51a1.51,1.51,0,0,0,1.5-1.5v-4.5a1.5,1.5,0,0,0-1.5-1.5H30.75V9.49A1.51,1.51,0,0,0,29.25,8Z"
      />
    </svg>
  );
}

export function DeleteButtonSVG() {
  return (
    <svg
      id="delete-button-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>svgアートボード 140</title>
      <circle cx="12" cy="12" r="10.54" />
      <path
        id="delte"
        className="delete-button-svg"
        d="M14.69,16.85h-.83V10.62H12.41v6.23h-.84V10.62H10.13v6.23H9.3V10.62H7.87v5.93a1.38,1.38,0,0,0,1.37,1.37h5.51a1.37,1.37,0,0,0,1.37-1.37V10.62H14.69Zm-.2-9v-.4a1.37,1.37,0,0,0-1.37-1.37H10.88A1.37,1.37,0,0,0,9.52,7.45v.4L7.36,8.3V9.74h9.28V8.3Zm-.75,0H10.26V7.66a1,1,0,0,1,1-1h1.57a1,1,0,0,1,1,1Z"
      />
    </svg>
  );
}

export function EraserButtonOffSVG({ active }: { active?: boolean }) {
  return (
    <svg
      id="eraser-button-off-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 20</title>
      <circle
        className="eraser-button-circle"
        style={{ opacity: active ? 0.3 : 0, fill: '#000' }}
        cx="27"
        cy="27"
        r="24.75"
      />
      <path
        className="eraser-button-off-svg"
        d="M28.57,14.18l-1.39,1.38-3.91-3.91a2.13,2.13,0,0,0-2.95,0l-8.66,8.67a2.08,2.08,0,0,0,0,2.94l3.91,3.91-1.38,1.39L28.57,42.94,43,28.56ZM12.93,22a.28.28,0,0,1,0-.4l8.67-8.67a.27.27,0,0,1,.2-.08.27.27,0,0,1,.19.08l3.92,3.92L16.85,25.9Z"
      />
    </svg>
  );
}

export function EraserCursorSVG() {
  return (
    <svg
      id="eraser-cursor-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 50</title>
      <rect
        className="eraser-cursor-circle"
        x="12.89"
        y="16.61"
        width="12.92"
        height="4.61"
        transform="translate(-7.71 19.22) rotate(-45)"
      />
      <path
        className="eraser-cursor-border-svg"
        d="M28.57,45.19A2.25,2.25,0,0,1,27,44.53L12.6,30.15a2.21,2.21,0,0,1-.66-1.59,2.24,2.24,0,0,1,.46-1.37l-2.33-2.34a4.35,4.35,0,0,1,0-6.13l8.67-8.66A4.32,4.32,0,0,1,21.8,8.81h0a4.32,4.32,0,0,1,3.06,1.25l2.34,2.33a2.24,2.24,0,0,1,1.37-.46,2.21,2.21,0,0,1,1.59.66L44.54,27a2.25,2.25,0,0,1,0,3.18L30.16,44.53A2.25,2.25,0,0,1,28.57,45.19ZM16.85,22.72l5.88-5.88-.93-.94-5.89,5.89Z"
      />
      <path
        className="eraser-cursor-svg"
        d="M28.57,14.18l-1.39,1.38-3.91-3.91a2.13,2.13,0,0,0-2.95,0l-8.66,8.67a2.08,2.08,0,0,0,0,2.94l3.91,3.91-1.38,1.39L28.57,42.94,43,28.56ZM12.93,22a.28.28,0,0,1,0-.4l8.67-8.67a.27.27,0,0,1,.2-.08.27.27,0,0,1,.19.08l3.92,3.92L16.85,25.9Z"
      />
    </svg>
  );
}

export function PaintCursorOnSVG({
  active,
  color,
}: {
  active?: boolean,
  color: { r: number, g: number, b: number },
}) {
  const { r, g, b } = color;

  return (
    <svg
      id="paint-cursor-on-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 70</title>
      <circle
        className="paint-cursor-on-circle"
        style={{
          opacity: active ? 1 : 0,
          fill: color ? `rgb(${r}, ${g}, ${b})` : '#000',
        }}
        cx="27"
        cy="27"
        r="24.75"
      />
      <path
        className="paint-cursor-on-border"
        d="M38.55,40.33A2.25,2.25,0,0,1,37,39.67l-1.5-1.5-.72.71a2.21,2.21,0,0,1-1.59.66h0a2.21,2.21,0,0,1-1.59-.66l-2-2-1.45,1.45a2.25,2.25,0,0,1-3.18,0l-1.49-1.49a2.25,2.25,0,0,1-.66-1.59,2.17,2.17,0,0,1,.17-.84l-8.31-8.3A7.29,7.29,0,1,1,25,15.81l8.3,8.3a2.27,2.27,0,0,1,2.44.5l1.48,1.48a2.25,2.25,0,0,1,.66,1.59,2.21,2.21,0,0,1-.66,1.59l-1.44,1.45,5.08,5.08a2.25,2.25,0,0,1,0,3.18l-.68.69a2.25,2.25,0,0,1-1.59.66Z"
      />
      <path
        className="paint-cursor-on-svg"
        style={{ fill: color ? `rgb(${r}, ${g}, ${b})` : '#000' }}
        d="M25.39,33.67l-9.15-9.15a5,5,0,0,1,7.13-7.12l9.15,9.15Zm8.72-7.47L25,35.26l1.49,1.49,9.06-9.07Zm-4,8,3,3,.68-.68-3-3Zm3-3-.68.69,6.14,6.14.68-.69Z"
      />
    </svg>
  );
}

export function PaintCursorSVG({
  color,
}: {
  color: { r: number, g: number, b: number },
}) {
  const { r, g, b } = color;

  return (
    <svg
      id="paint-cursor-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 40</title>
      <path
        className="paint-cursor-border"
        d="M41.27,43.05a2.21,2.21,0,0,1-1.58-.67l-2.3-2.31a2.12,2.12,0,0,1-.37.48l-.85.85a2.28,2.28,0,0,1-1.58.65h0A2.22,2.22,0,0,1,33,41.38l-2.85-2.87L28,40.68a2.23,2.23,0,0,1-1.58.65h0a2.25,2.25,0,0,1-1.59-.66l-1.83-1.85a2.24,2.24,0,0,1-.65-1.6,2.19,2.19,0,0,1,.32-1.15L12.08,25.44a8.5,8.5,0,1,1,12.08-12L34.69,24.1a2.24,2.24,0,0,1,2.75.35l1.83,1.85a2.2,2.2,0,0,1,.65,1.59,2.25,2.25,0,0,1-.66,1.59l-2.19,2.17,6.66,6.72a2.26,2.26,0,0,1,0,3.19l-.85.84a2.24,2.24,0,0,1-1.59.65Z"
      />
      <path
        className="paint-cursor-svg"
        style={{ fill: color ? `rgb(${r}, ${g}, ${b})` : '#000' }}
        d="M25,35.26,13.68,23.85a6.25,6.25,0,1,1,8.88-8.8l11.3,11.41ZM35.84,26l-11.3,11.2,1.83,1.85,11.3-11.2Zm-5,10,3.77,3.8.85-.84-3.77-3.81Zm3.73-3.7-.85.85,7.58,7.65.85-.84Z"
      />
    </svg>
  );
}

export function SyringeButtonOffSVG({ active }: { active?: boolean }) {
  return (
    <svg
      id="syringe-button-off-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 30</title>
      <circle
        className="syringe-button-off-circle"
        style={{ opacity: active ? 0.3 : 0, fill: '#000' }}
        cx="27"
        cy="27"
        r="24.75"
      />
      <path
        className="syringe-button-off-svg"
        d="M32.78,26.22A1.6,1.6,0,1,1,35,28.49l-.46.45h0a.87.87,0,0,0,0,1.24.84.84,0,0,0,.6.26h0a4.58,4.58,0,1,1-4.79,4.74h0a.89.89,0,0,0-.26-.6.87.87,0,0,0-1.24,0h0l-.46.46a1.6,1.6,0,1,1-2.25-2.27ZM19.26,14.4a2.47,2.47,0,0,1-3.5,0l-1.27,1.26a2.48,2.48,0,0,1,0,3.5l.11.23L26.35,31.26l4.91-4.86L19.49,14.52Z"
      />
    </svg>
  );
}

export function SyringeButtonOnSVG({ active }: { active?: boolean }) {
  return (
    <svg
      id="syringe-button-on-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 80</title>
      <circle
        className="syringe-button-on-circle"
        style={{ opacity: active ? 0.3 : 0, fill: '#000' }}
        cx="27"
        cy="27"
        r="24.75"
      />
      <path
        className="syringe-button-on-svg"
        d="M32.78,26.22A1.6,1.6,0,1,1,35,28.49l-.46.45h0a.87.87,0,0,0,0,1.24.84.84,0,0,0,.6.26h0a4.58,4.58,0,1,1-4.79,4.74h0a.89.89,0,0,0-.26-.6.87.87,0,0,0-1.24,0h0l-.46.46a1.6,1.6,0,1,1-2.25-2.27ZM19.26,14.4a2.47,2.47,0,0,1-3.5,0l-1.27,1.26a2.48,2.48,0,0,1,0,3.5l.11.23L26.35,31.26l4.91-4.86L19.49,14.52Z"
      />
    </svg>
  );
}

export function SyringeCursorSVG() {
  return (
    <svg
      id="syringe-cursor-svg"
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 54 54"
    >
      <title>svgアートボード 60</title>
      <path
        className="syringe-cursor-border"
        d="M34.87,41.75a6.79,6.79,0,0,1-4.83-2,6.69,6.69,0,0,1-1.48-2.28,3.71,3.71,0,0,1-1.28.22,3.82,3.82,0,0,1-3.84-3.85A4,4,0,0,1,23.93,32L13.09,21a2.65,2.65,0,0,1-.42-.59l-.11-.23A2.25,2.25,0,0,1,13,17.62a.21.21,0,0,0,0-.29,2.26,2.26,0,0,1-.65-1.59A2.22,2.22,0,0,1,13,14.15l1.26-1.25a2.25,2.25,0,0,1,3.18,0,.2.2,0,0,0,.14.06.2.2,0,0,0,.15-.06,2.25,2.25,0,0,1,2.59-.41l.22.11a2.08,2.08,0,0,1,.59.43L32,24a3.83,3.83,0,0,1,5.68,3.38,3.73,3.73,0,0,1-.23,1.29,7,7,0,0,1,2.26,1.51,6.8,6.8,0,0,1-4.83,11.58Z"
      />
      <path
        className="syringe-cursor-svg"
        d="M32.72,26.22A1.58,1.58,0,0,1,35,28.47l-.45.45h0a.87.87,0,0,0,.59,1.49h0a4.54,4.54,0,1,1-4.75,4.7h0a.92.92,0,0,0-.25-.6.88.88,0,0,0-1.24,0h0l-.45.44a1.57,1.57,0,0,1-2.24,0,1.59,1.59,0,0,1,0-2.24ZM19.33,14.52a2.46,2.46,0,0,1-3.47,0L14.6,15.75a2.45,2.45,0,0,1,0,3.47l.11.22L26.36,31.22l4.86-4.82L19.55,14.63Z"
      />
    </svg>
  );
}
