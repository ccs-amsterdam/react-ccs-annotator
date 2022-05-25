import React from "react";
import QuestionTask from "./QuestionTask";
import AnnotateTask from "./AnnotateTask";

const AnnotateUnit = ({ unit, jobServer, unitIndex, setUnitIndex, fullScreenNode }) => {
  // Both the unit and the codingjob can have a codebook
  // codebook is the default codebook applied to all units
  // unit.codebook is a unit specific codebook that overrides the default
  if (unitIndex < 0) return null;
  const codebook = unit?.codebook || jobServer?.codebook;
  if (!codebook || !unit) return null;

  if (!codebook?.type) return null;

  if (codebook.type === "questions")
    return (
      <QuestionTask
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        fullScreenNode={fullScreenNode}
      />
    );

  if (codebook.type === "annotate")
    return (
      <AnnotateTask
        unit={unit}
        codebook={codebook}
        setUnitIndex={setUnitIndex}
        fullScreenNode={fullScreenNode}
      />
    );

  return null;
};

export default AnnotateUnit;