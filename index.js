import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { createPopper } from '@popperjs/core';

const TooltipContentStyled = styled.span`
    border-radius: 1rem 1rem 1rem 0;
    border: 2px solid skyblue;
    background: white;
    height: auto;
    padding: 14px 9px;
    object-fit: contain;
    box-shadow: 2px 2px 12px 0 rgba(0, 0, 0, 0.5);
    font-family: Roboto, Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.25;
    letter-spacing: normal;
`;

function CountryStateMap({
                           customize,
                           defaultFill,
                           onClick,
                           width,
                           height,
                           statesData = {},
                           selectedFill,
                           defaultSelected,
                         }) {
  const popperInstance = React.useRef();
  const [currentHovered, setCurrenHovered] = React.useState(null);
  const [currentSelection, setCurrentSelection] = React.useState(defaultSelected);

  const fillStateColor = state => {
    if (selectedFill && state === currentSelection) {
      return selectedFill;
    }
    if (customize && customize[state] && customize[state].fillHandler) {
      return customize[state].fillHandler(state);
    }
    if (customize && customize[state] && customize[state].fill) {
      return customize[state].fill;
    }
    return defaultFill;
  };

  const getHoverValue = state => {
    if (customize && customize[state] && customize[state].hoverHandler) {
      return customize[state].hoverHandler(state);
    }
    return state;
  };

  const stateClickHandler = state => {
    setCurrentSelection(state);
    if (customize && customize[state] && customize[state].clickHandler) {
      return customize[state].clickHandler;
    }
    return onClick(state);
  };

  function generateGetBoundingClientRect(x = -50, y = -50) {
    return () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
    });
  }

  const virtualElement = {
    getBoundingClientRect: generateGetBoundingClientRect(),
    contextElement: document.getElementById('tracker-tooltip'),
  };

  React.useEffect(() => {
    const popEl = document.getElementById('tracker-tooltip');
    popperInstance.current = createPopper(virtualElement, popEl, {
      placement: 'top-start',
    });
  });

  const handleHoverExit = () => {
    virtualElement.getBoundingClientRect = generateGetBoundingClientRect();
    popperInstance.current.update();
    setCurrenHovered(null);
  };

  const buildPaths = () => {
    return (
      statesData &&
      Object.keys(statesData).map(stateKey => {
        const { dimensions } = statesData[stateKey];
        const fill = fillStateColor(stateKey);

        return (
          <path
            stroke="black"
            key={stateKey}
            d={dimensions}
            fill={fill}
            data-name={stateKey}
            className={`${stateKey} state`}
            onClick={() => {
              stateClickHandler(stateKey);
            }}
            onMouseMove={({ clientX: x, clientY: y }) => {
              virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
                x,
                y - 20
              );
              popperInstance.current.update();
              setCurrenHovered(getHoverValue(stateKey));
            }}
          />
        );
      })
    );
  };

  React.useEffect(() => {
    setCurrentSelection(defaultSelected);
  }, [defaultSelected]);

  return (
    <>
      <TooltipContentStyled id="tracker-tooltip">{currentHovered}</TooltipContentStyled>
      <svg
        onMouseOut={handleHoverExit}
        className="state-map"
        width={width}
        height={height}
        viewBox="0 0 959 593"
      >
        <g className="outlines">{buildPaths()}</g>
      </svg>
    </>
  );
}

CountryStateMap.propTypes = {
  onClick: PropTypes.func.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  defaultFill: PropTypes.string,
  selectedFill: PropTypes.string,
  customize: PropTypes.object,
  statesData: PropTypes.object,
  defaultSelected: PropTypes.string,
};

CountryStateMap.defaultProps = {
  width: 635,
  height: 450,
  defaultFill: 'grey',
  selectedFill: 'skyblue',
  customize: {},
  statesData: {},
  defaultSelected: '',
};

export default CountryStateMap;
