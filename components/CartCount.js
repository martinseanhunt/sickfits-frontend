import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled from 'styled-components'

// This whole thing would look even better if we used an update function when a cart item is 
// added so we don't have to wait for the user query to re-run

// The approach to animations here I think is how they're doing things like the infinum website

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.4s;
    backface-visibility: hidden; /* hides the back of the div */
  }
  /* itinital state of the noew (entered) dot */
  .count-enter {
    transform: scale(2) rotateX(0.5turn)
  }
  /* where it's going over the course of the timeout */
  .count-enter-active {
    transform: rotateX(0)
  }
  /* itinital state of the old (exiting) dot */
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0)
  }

  .count-exit-active {
    transform: rotateX(0.5turn) scale(2);
  }
`

const Dot = styled.div`
  background: ${({theme}) => theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;

  /* Makes sure that number widths are always the same i.e. 1 will be the same width as 2 so layout doesn't break */
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`

class CartCount extends Component {
  render() {
    return (
      <AnimationStyles>
        <TransitionGroup>
          <CSSTransition
            className="count"
            classNames="count"
            key={this.props.count}
            timeout={{enter: 400, exit: 400}}
            unmountOnExit
          >
            <Dot>{this.props.count}</Dot>
          </CSSTransition>
        </TransitionGroup>
      </AnimationStyles>
    )
  }
}

export default CartCount