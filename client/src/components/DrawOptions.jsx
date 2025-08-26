import {
  FaLock,
  FaHandPaper,
  FaMousePointer,
  FaSquare,
  FaGem,
  FaCircle,
  FaArrowRight,
  FaMinus,
  FaPencilAlt,
  FaFont,
  FaRegImage,
  FaEraser,
  FaShapes,
} from 'react-icons/fa';

export default function DrawOptions() {
  return (
    <div className="drawing-options">
      <div className="option">
        <FaHandPaper />
        <div className="txt">0</div>
      </div>
      <div className="option">
        <FaMousePointer />
        <div className="txt">1</div>
      </div>
      <div className="option">
        <FaSquare />
        <div className="txt">2</div>
      </div>
      <div className="option">
        <FaGem />
        <div className="txt">3</div>
      </div>
      <div className="option">
        <FaCircle />
        <div className="txt">4</div>
      </div>
      <div className="option">
        <FaArrowRight />
        <div className="txt">5</div>
      </div>
      <div className="option">
        <FaMinus />
        <div className="txt">6</div>
      </div>
      <div className="option">
        <FaPencilAlt />
        <div className="txt">7</div>
      </div>
      <div className="option">
        <FaFont />
        <div className="txt">8</div>
      </div>
      <div className="option">
        <FaRegImage />
        <div className="txt">9</div>
      </div>
      <div className="option">
        <FaEraser />
        <div className="txt">10</div>
      </div>
    </div>
  );
}
