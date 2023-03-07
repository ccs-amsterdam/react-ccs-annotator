import { useEffect, useRef } from "react";
import { FaWindowClose } from "react-icons/fa";
import styled from "styled-components";

const StyledDiv = styled.div<{ open: boolean }>`
  position: fixed;
  z-index: 9999;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: 50px;
  transition: all 0.3s;

  ${(p) =>
    p.open
      ? `
        pointer-events: auto;
        backdrop-filter: blur(5px);
        background: var(--background-transparent);
    `
      : `
        pointer-events: none;
        backdrop-filter: none;
        background: transparent;
    `}

  .Modal {
    font-size: var(--font-size);
    position: relative;
    display: flex;
    width: min(80%, 600px);
    height: min(90%, 600px);
    margin: auto;

    transition: all 0.3s;
    border: 3px solid var(--primary);
    box-shadow: 0 0 10px var(--primary-dark);
    border-radius: 5px;
    position: relative;
    z-index: 10000;
    background: var(--background);
    color: var(--text);
    padding: 1.5rem;
    ${(p) =>
      p.open
        ? `
        opacity: 1;
        transform: scale(1);
    `
        : `
        opacity: 0;
        transform: scale(0);
    `}

    .ModalContent {
      margin: auto;
      width: auto;
      overflow: auto;
      max-height: 100%;

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: var(--primary-text);
      }
    }

    .closeIcon {
      font-size: 1.5rem;
      vertical-align: top;
      cursor: pointer;
      position: absolute;
      bottom: 0;
      z-index: 10001;
      width: 3.5rem;
      transform: translateY(1.45rem);
      left: calc(50% - 2.5rem);

      svg:hover {
        fill: var(--text);
      }
    }
  }
`;

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Modal = ({ children, open, setOpen }: ModalProps) => {
  const container = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const closeIcon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const modalEl = modal.current;
    const containerEl = container.current;
    const closeIconEl = closeIcon.current;

    function onClick(e: any) {
      if (closeIconEl && closeIconEl.contains(e.target)) setOpen(false);
      e.stopPropagation();
      if (modalEl && !modalEl.contains(e.target)) {
        setOpen(false);
      }
    }
    containerEl.addEventListener("click", onClick);
    return () => containerEl.removeEventListener("click", onClick);
  }, [container, modal, open, closeIcon, setOpen]);

  return (
    <StyledDiv open={open} ref={container}>
      <div className="Modal" ref={modal}>
        <div className="ModalContent">
          {children}
          <br />
        </div>
        <div className="closeIcon" ref={closeIcon}>
          <FaWindowClose size="100%" color="var(--primary)" onClick={() => setOpen(false)} />
        </div>
      </div>
    </StyledDiv>
  );
};

export default Modal;
