import styled from "styled-components";

const Loader = () => {
    return (
        <StyledWrapper>
            <div className="spinner center">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="spinner-blade" />
                ))}
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .spinner {
    font-size: 28px;
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .spinner.center {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }

  .spinner .spinner-blade {
    position: absolute;
    left: 0.4629em;
    bottom: 0;
    width: 0.074em;
    height: 0.2777em;
    border-radius: 0.0555em;
    background-color: transparent;
    transform-origin: center -0.2222em;
    animation: spinner-fade 1s infinite linear;
  }

  ${[...Array(12)]
        .map(
            (_, i) => `
      .spinner .spinner-blade:nth-child(${i + 1}) {
        animation-delay: ${(i * 0.083).toFixed(3)}s;
        transform: rotate(${i * 30}deg);
      }
    `
        )
        .join("")}

  @keyframes spinner-fade {
    0% {
      background-color: #69717d;
    }
    100% {
      background-color: transparent;
    }
  }
`;

export default Loader;
