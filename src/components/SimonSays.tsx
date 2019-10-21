import React, { MouseEvent, Component } from "react";
import { Container } from "reactstrap";
import { Howl } from "howler";
import greenSound from "../audio/green.mp3";
import redSound from "../audio/red.mp3";
import yellowSound from "../audio/yellow.mp3";
import blueSound from "../audio/blue.mp3";
import failSound from "../audio/fail.wav";
import SimonSaysState from "../interfaces/simonSays.i";
import background from "../images/background.jpg";

class SimonSays extends Component<{}, SimonSaysState> {
  public readonly state: SimonSaysState = {
    currentStreak: 0,
    strictMode: false,
    combination: [],
    userTurn: false,
    playingGame: false,
    turnNum: 0,
    speed: 1000,
    switchOn: false,
  };

  private failTimer: number;

  private greenSound = new Howl({
    src: [greenSound],
    volume: 0.5,
  });

  private redSound = new Howl({
    src: [redSound],
    volume: 0.5,
  });

  private yellowSound = new Howl({
    src: [yellowSound],
    volume: 0.5,
  });

  private blueSound = new Howl({
    src: [blueSound],
    volume: 0.5,
  });

  private failSound = new Howl({
    src: [failSound],
    volume: 0.5,
  });

  public componentWillUnmount(): void {
    clearTimeout(this.failTimer);
  }

  private onStartTimer = (): void => {
    const { strictMode, currentStreak } = this.state;
    this.failTimer = window.setTimeout(async (): Promise<void> => {
      this.setState({ userTurn: false });
      this.failSound.play();
      let i = 0;
      do {
        document.getElementById("score").innerText = "!!";
        await this.wait(200);
        document.getElementById("score").innerText = "";
        await this.wait(200);
        i += 1;
      } while (i < 5);
      this.setState({ userTurn: true });
      document.getElementById("score").innerText = currentStreak.toString();
      if (strictMode) {
        return this.onFailStrict();
      }
      return this.onFailNormal();
    }, 5000);
  };

  private onTakeTurn = async (e: MouseEvent<HTMLDivElement>): Promise<void> => {
    const { switchOn, currentStreak, combination, strictMode } = this.state;
    let { turnNum } = this.state;
    if (!switchOn) return;
    clearTimeout(this.failTimer);
    this.onStartTimer();
    if (turnNum < combination.length) {
      const turn = (e.target as HTMLDivElement).id;
      if (turn === combination[turnNum]) {
        clearTimeout(this.failTimer);
        this.onStartTimer();
        this.onFlashColour(combination[turnNum]);
        turnNum++;
        this.setState({ turnNum });
        if (turnNum === combination.length) {
          clearTimeout(this.failTimer);
          if (currentStreak <= 4) this.setState({ speed: 1000 });
          else if (currentStreak > 4 && currentStreak <= 8) this.setState({ speed: 750 });
          else this.setState({ speed: 500 });
          this.setState({
            currentStreak: currentStreak + 1,
            userTurn: false,
          });
          this.onNewCombination();
        }
      } else {
        this.failSound.play();
        this.setState({ userTurn: false });
        clearTimeout(this.failTimer);
        let i = 0;
        do {
          document.getElementById("score").innerText = "!!";
          await this.wait(200);
          document.getElementById("score").innerText = "";
          await this.wait(200);
          i += 1;
        } while (i < 5);
        document.getElementById("score").innerText = currentStreak.toString();
        this.setState({ userTurn: true });
        if (strictMode) {
          this.onFailStrict();
        } else {
          this.onFailNormal();
        }
      }
    }
  };

  private onPowerSwitch = (): void => {
    const { switchOn } = this.state;
    this.onResetGame();
    clearTimeout(this.failTimer);
    this.setState({ switchOn: !switchOn });
  };

  private onNewCombination = async (): Promise<void> => {
    const { switchOn, combination } = this.state;
    if (!switchOn) return this.onResetGame();
    clearTimeout(this.failTimer);
    this.getColour();
    await this.wait(500);
    await this.onFlashColours();
    return this.setState({ combination, userTurn: true, turnNum: 0 });
  };

  private onFlashColour = async (colour: string): Promise<void> => {
    const { switchOn } = this.state;
    if (!switchOn) return this.onResetGame();
    switch (colour) {
      case "green":
        this.greenSound.play();
        break;
      case "red":
        this.redSound.play();
        break;
      case "yellow":
        this.yellowSound.play();
        break;
      case "blue":
        this.blueSound.play();
        break;
      default:
        break;
    }
    document.getElementById(colour).classList.add(`simon__flash-${colour}-button`);
    await this.wait(300);
    return document
      .getElementById(colour)
      .classList.remove(`simon__flash-${colour}-button`);
  };

  private onStartGame = async (): Promise<void> => {
    clearTimeout(this.failTimer);
    this.setState({ userTurn: true, playingGame: true });
    this.getColour();
    await this.wait(500);
    await this.onFlashColours();
  };

  private onSetStrictMode = (): void => {
    const { strictMode } = this.state;
    this.setState({ strictMode: !strictMode });
  };

  private onFlashColours = async (): Promise<void> => {
    const { combination } = this.state;
    console.log(combination);

    for (const colour in combination) {
      if ({}.hasOwnProperty.call(combination, colour)) {
        const { switchOn, speed } = this.state;
        if (!switchOn) return this.onResetGame();
        await this.wait(speed);
        await this.onFlashColour(combination[colour]);
      }
    }
    return this.onStartTimer();
  };

  private getColour = (): string => {
    const { combination } = this.state;
    const randomNum: number = Math.floor(Math.random() * 4);
    let colour: string;
    switch (randomNum) {
      case 0:
        colour = "green";
        break;
      case 1:
        colour = "red";
        break;
      case 2:
        colour = "yellow";
        break;
      case 3:
        colour = "blue";
        break;
      default:
        break;
    }
    combination.push(colour);
    this.setState({ combination });
    return colour;
  };

  private onFailNormal = async (): Promise<void> => {
    const { switchOn } = this.state;
    if (!switchOn) return this.onResetGame();
    this.setState({
      turnNum: 0,
      userTurn: false,
    });
    await this.wait(500);
    await this.onFlashColours();
    return this.setState({
      userTurn: true,
    });
  };

  private onFailStrict = async (): Promise<void> => {
    const { switchOn } = this.state;
    if (!switchOn) return this.onResetGame();
    this.setState({
      currentStreak: 0,
      combination: [],
      userTurn: false,
      turnNum: 0,
    });
    await this.wait(500);
    this.getColour();
    await this.onFlashColours();
    return this.setState({
      userTurn: true,
    });
  };

  private onResetGame = (): void => {
    clearTimeout(this.failTimer);
    this.setState({
      currentStreak: 0,
      combination: [],
      userTurn: false,
      playingGame: false,
      turnNum: 0,
      speed: 1000,
      strictMode: false,
    });
  };

  private wait = (sec: number): Promise<void> =>
    new Promise((resolve): void => {
      setTimeout(resolve, sec);
    });

  public render(): JSX.Element {
    const { switchOn, userTurn, playingGame, currentStreak, strictMode } = this.state;
    return (
      <div
        className="simon__background"
        style={{ background: `url(${background}) no-repeat center center fixed` }}
      >
        <Container>
          <div className="simon__container">
            <div
              className="simon__green-button"
              id="green"
              onClick={switchOn && userTurn ? this.onTakeTurn : undefined}
              role="button"
              tabIndex={0}
            />
            <div
              className="simon__red-button"
              id="red"
              onClick={switchOn && userTurn ? this.onTakeTurn : undefined}
              role="button"
              tabIndex={0}
            />
            <div
              className="simon__yellow-button"
              id="yellow"
              onClick={switchOn && userTurn ? this.onTakeTurn : undefined}
              role="button"
              tabIndex={0}
            />
            <div
              className="simon__blue-button"
              id="blue"
              onClick={switchOn && userTurn ? this.onTakeTurn : undefined}
              role="button"
              tabIndex={0}
            />
            <div className="simon__center-controls">
              <div className="simon__text-container">
                <div className="simon__title">Simon</div>
                <div className="simon__copyright">&copy;</div>
              </div>
              <div className="simon__button-container">
                <div
                  id="score"
                  className={switchOn ? "simon__score--active" : "simon__score"}
                >
                  {!switchOn ? "--" : playingGame ? currentStreak : "--"}
                </div>
                <div>
                  <div
                    className={
                      playingGame ? "simon__light--active" : "simon__light--inactive"
                    }
                  />
                  <div
                    className={
                      playingGame ? "simon__start-button--pressed" : "simon__start-button"
                    }
                    onClick={switchOn && !playingGame ? this.onStartGame : undefined}
                    role="button"
                    tabIndex={0}
                  />
                  <div className="simon__text">START</div>
                </div>
                <div>
                  <div
                    className={
                      strictMode ? "simon__light--active" : "simon__light--inactive"
                    }
                  />
                  <div
                    onClick={switchOn && !playingGame ? this.onSetStrictMode : undefined}
                    className={
                      strictMode || playingGame
                        ? "simon__strict-button--pressed"
                        : "simon__strict-button"
                    }
                  />
                  <div className="simon__text">STRICT</div>
                </div>
              </div>
              <div className="simon__switch-container">
                <div className="simon__toggle-text">OFF</div>
                <label className="simon__switch" htmlFor="power-switch">
                  <input
                    className="simon__switch--toggle"
                    type="checkbox"
                    name="power-switch"
                    checked={switchOn}
                    onChange={this.onPowerSwitch}
                  />
                  <span
                    className="simon__slider"
                    role="button"
                    tabIndex={0}
                    onClick={this.onPowerSwitch}
                  />
                </label>
                <div className="simon__toggle-text">ON</div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

export default SimonSays;
