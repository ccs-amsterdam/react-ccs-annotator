import React, { useState, useEffect, useRef } from "react";
import QuestionForm from "./QuestionForm";
import Document from "../../Document/Document";
import { useSwipeable } from "react-swipeable";
import { codeBookEdgesToMap, getCodeTreeArray } from "../../../functions/codebook";
import { Button, Form, Input, Portal, Segment } from "semantic-ui-react";
import standardizeColor from "../../../functions/standardizeColor";
import swipeControl from "../functions/swipeControl";
import useLocalStorage from "../../../hooks/useLocalStorage";
import styled from "styled-components";
import { AnswerOption, SwipeOptions, Swipes } from "../../../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TextWindow = styled.div`
  flex: 1 1 auto;
  position: relative;
`;

const SwipeableBox = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  outline: 1px solid black;
  outline-offset: -1px;
  position: absolute;
`;

const SwipeCode = styled.div`
  padding: 0.6em 0.3em;
  width: 100%;
  font-size: 3em;
  position: absolute;
`;

const Text = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  background-color: white;
  font-size: ${(props) => props.fontsize}em;
  box-shadow: 5px 5px 20px 5px;
`;

const QuestionMenu = styled.div`
  height: ${(props) => (props.minifiedAnswerForm ? null : props.formHeight)};
  min-height: ${(props) => (props.minifiedAnswerForm ? null : "200px")};
  font-size: ${(props) => props.fontSize}em;
`;

const QuestionTask = ({ unit, codebook, setUnitIndex, fullScreenNode, blockEvents = false }) => {
  const [tokens, setTokens] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(null);
  const refs = {
    text: useRef(),
    box: useRef(),
    code: useRef(),
  };
  const [textReady, setTextReady] = useState(0);
  const [settings, setSettings] = useLocalStorage("questionTaskSettings", {
    splitHeight: 70,
    upperTextSize: 1,
    lowerTextSize: 1,
  });
  const divref = useRef(null);

  useEffect(() => {
    if (!codebook?.questions) return;
    setQuestions(prepareQuestions(codebook));
  }, [codebook]);

  useEffect(() => {
    // when new unit arrives, reset style (in case of swipe) and make
    // text transparent.
    resetStyle(refs.text, refs.box);
  }, [refs.text, refs.box, unit, questionIndex]);

  useEffect(() => {
    // fade in text when the text is ready (which Document tells us)
    fadeIn(refs.text, refs.box);
  }, [textReady, refs.text, refs.box, questionIndex]);

  // swipe controlls need to be up in the QuestionTask component due to working on the div containing the question screen
  // use separate swipe for text (document) and menu rows, because swiping up in the text is only possible if scrolled all the way down
  const [swipe, setSwipe] = useState<Swipes>(null);
  const textSwipe = useSwipeable(swipeControl(questions?.[questionIndex], refs, setSwipe, false));
  const menuSwipe = useSwipeable(swipeControl(questions?.[questionIndex], refs, setSwipe, true));

  if (!unit) return null;

  // The size of the text div, in pct compared to the answer div
  let splitHeight = unit?.text_window_size ?? settings.splitHeight;
  const formHeight = splitHeight === "auto" ? "auto" : `${100 - splitHeight}%`;

  // if there are only annotinder or confirm questions, minify the answer form
  let minifiedAnswerForm = true;
  const minifiable = ["annotinder", "confirm"];
  for (let question of questions || [])
    if (!minifiable.includes(question.type)) minifiedAnswerForm = false;

  return (
    <Container ref={divref}>
      <TextWindow {...textSwipe}>
        <SwipeableBox ref={refs.box}>
          {/* This div moves around behind the div containing the document to show the swipe code  */}
          <SwipeCode ref={refs.code} />
          <Text ref={refs.text} fontsize={settings.upperTextSize}>
            <Document
              unit={unit}
              setReady={setTextReady}
              returnTokens={setTokens}
              fullScreenNode={fullScreenNode}
            />
          </Text>
        </SwipeableBox>
      </TextWindow>
      <QuestionMenu
        {...menuSwipe}
        minifiedAnswerForm={minifiedAnswerForm}
        fontSize={settings.lowerTextSize}
        formHeight={formHeight}
      >
        <QuestionForm
          unit={unit}
          tokens={tokens}
          questions={questions}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
          setUnitIndex={setUnitIndex}
          swipe={swipe}
          blockEvents={blockEvents}
        >
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
            cantChangeSplitHeight={minifiedAnswerForm || unit?.text_window_size != null}
          />
        </QuestionForm>
      </QuestionMenu>
    </Container>
  );
};

const SettingsPopup = ({ settings, setSettings, fullScreenNode, cantChangeSplitHeight }) => {
  return (
    <Portal
      mountNode={fullScreenNode || undefined}
      on="click"
      trigger={
        <Button
          size="large"
          icon="setting"
          style={{
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "10px 10px",
            paddingBottom: "2px",
            zIndex: 9000,
          }}
        />
      }
    >
      <Segment
        style={{
          bottom: "0",
          position: "fixed",
          width: "50%",
          zIndex: 1000,
          background: "#dfeffb",
          border: "1px solid #136bae",
        }}
      >
        <Form>
          <Form.Group grouped>
            {cantChangeSplitHeight ? null : (
              <Form.Field>
                <label>
                  Text window height{" "}
                  <span style={{ color: "blue" }}>{`${settings.splitHeight}%`}</span>
                </label>
                <Input
                  size="mini"
                  step={2}
                  min={20}
                  max={80}
                  type="range"
                  value={settings.splitHeight}
                  onChange={(e, d) => setSettings((state) => ({ ...state, splitHeight: d.value }))}
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>
                Content text size{" "}
                <span style={{ color: "blue" }}>{`${settings.upperTextSize}`}</span>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.upperTextSize}
                onChange={(e, d) => setSettings((state) => ({ ...state, upperTextSize: d.value }))}
              />
            </Form.Field>
            <Form.Field>
              <label>
                Answer field text size{" "}
                <span style={{ color: "blue" }}>{`${settings.lowerTextSize}`}</span>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.lowerTextSize}
                onChange={(e, d) => setSettings((state) => ({ ...state, lowerTextSize: d.value }))}
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    </Portal>
  );
};

const prepareQuestions = (codebook) => {
  const questions = codebook.questions;
  return questions.map((question) => {
    const fillMissingColor = !["scale"].includes(question.type);
    const codeMap = codeBookEdgesToMap(question.codes, fillMissingColor);
    let cta = getCodeTreeArray(codeMap);
    const [options, swipeOptions] = getOptions(cta);
    return { ...question, options, swipeOptions }; // it's important that this deep copies question
  });
};

const getOptions = (cta): [AnswerOption[], SwipeOptions] => {
  const options = [];
  const swipeOptions: any = {}; // object, for fast lookup in swipeControl

  for (let code of cta) {
    if (!code.active) continue;
    if (!code.activeParent) continue;
    let tree = code.tree.join(" - ");
    const option: AnswerOption = {
      code: code.code,
      tree: tree,
      makes_irrelevant: code.makes_irrelevant,
      required_for: code.required_for,
      color: standardizeColor(code.color, "88"),
      ref: React.createRef(), // used for keyboard navigation of buttons
    };
    if (code.swipe) swipeOptions[code.swipe] = option;
    options.push(option);
  }
  // if swipe options for left and right are not specified, use order.
  if (!swipeOptions.left && !swipeOptions.right) {
    swipeOptions.left = options?.[0];
    swipeOptions.right = options?.[1];
    swipeOptions.up = options?.[2];
  }
  return [options, swipeOptions];
};

const resetStyle = (text, box) => {
  if (!text.current) return null;
  box.current.style.backgroundColor = "white";
  text.current.style.transition = ``;
  box.current.style.transition = ``;
  box.current.style.opacity = 0;
  text.current.style.transform = "translateX(0%) translateY(0%)";
};

const fadeIn = (text, box) => {
  if (!text.current) return null;
  box.current.style.transition = `opacity 200ms ease-out`;
  box.current.style.opacity = 1;
};

export default React.memo(QuestionTask);
