import { Component } from "react";
import Immutable from "immutable";
import {
  WindowScroller,
  List,
  AutoSizer,
  InfiniteLoader,
} from "react-virtualized";
import { generateRandomList } from "./utils";
import "./App.css";

const list = Immutable.List(generateRandomList());

const STATUS_LOADING = 1;
const STATUS_LOADED = 2;

class App extends Component {
  state = {
    customElement: null,
    loadedRowCount: 0,
    loadedRowsMap: {},
    loadingRowCount: 0,
  };

  _timeoutIdMap = {};

  componentWillUnmount() {
    Object.keys(this._timeoutIdMap).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
  }

  isRowLoaded = ({ index }) => {
    const { loadedRowsMap } = this.state;
    return !!loadedRowsMap[index]; // STATUS_LOADING or STATUS_LOADED
  };

  loadMoreRows = ({ startIndex, stopIndex }) => {
    const { loadedRowsMap, loadingRowCount } = this.state;
    const increment = stopIndex - startIndex + 1;

    for (var i = startIndex; i <= stopIndex; i++) {
      loadedRowsMap[i] = STATUS_LOADING;
    }

    this.setState({
      loadingRowCount: loadingRowCount + increment,
    });

    const timeoutId = setTimeout(() => {
      const { loadedRowCount, loadingRowCount } = this.state;

      delete this._timeoutIdMap[timeoutId];

      for (var i = startIndex; i <= stopIndex; i++) {
        loadedRowsMap[i] = STATUS_LOADED;
      }

      this.setState({
        loadingRowCount: loadingRowCount - increment,
        loadedRowCount: loadedRowCount + increment,
      });

      promiseResolver();
    }, 1000 + Math.round(Math.random() * 2000));

    this._timeoutIdMap[timeoutId] = true;

    let promiseResolver;

    return new Promise((resolve) => {
      promiseResolver = resolve;
    });
  };

  rowRenderer = ({ index, key, style, isScrolling, isVisible }) => {
    const { loadedRowsMap } = this.state;

    const row = list.get(index);
    let content;

    if (loadedRowsMap[index] === STATUS_LOADED) {
      content = row.name;
    } else {
      content = <div className={"placeholder"} style={{ width: row.size }} />;
    }

    return (
      <div
        key={key}
        className={`row ${isScrolling && "rowScrolling"} ${
          isVisible && "isVisible"
        }`}
        style={style}
      >
        {content}
      </div>
    );
  };

  render() {
    return (
      <div className={"demo"}>
        <div className={"headerRow"}>
          <div className={"logoRow"}>
            <div className={"ReactVirtualizedContainer"}>
              <img
                alt="React virtualized"
                className={"logo"}
                src="https://cloud.githubusercontent.com/assets/29597/11736841/c0497158-9f87-11e5-8dfe-9c0be97d4286.png"
              />
              <div className={"PrimaryLogoText"}>React</div>
              <div className={"SecondaryLogoText"}>Virtualized</div>
            </div>
          </div>

          <div className={"ComponentList"}>
            <span>Collection</span>
            <span>Grid</span>
            <span>List</span>
            <span>Masonry</span>
            <span>Table</span>
          </div>

          <div className={"HighOrderComponentList"}>
            <span>ArrowKeyStepper</span>
            <span>AutoSizer</span>
            <span>CellMeasurer</span>
            <span>ColumnSizer</span>
            <span>InfiniteLoader</span>
            <span>MultiGrid</span>
            <span>ScrollSync</span>
            <span>WindowScroller</span>
          </div>
        </div>

        <div
          className={"ScrollingBody"}
          ref={(e) => {
            if (!this.state.customElement) {
              this.setState({ customElement: e });
            }
          }}
        >
          <div className={`ContentBox`}>
            <h1 className={"Header"}>WindowScroller + InfiniteLoader</h1>

            {this.state.customElement && (
              <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMoreRows}
                rowCount={list.size}
              >
                {({
                  onRowsRendered,
                  registerChild: registerInfiniteLoaderChild,
                }) => (
                  <WindowScroller scrollElement={this.state.customElement}>
                    {({
                      height,
                      isScrolling,
                      registerChild: registerWindowScrollerChild,
                      onChildScroll,
                      scrollTop,
                    }) => (
                      <div className={"WindowScrollerWrapper"}>
                        <AutoSizer disableHeight>
                          {({ width }) => (
                            <div ref={registerWindowScrollerChild}>
                              <List
                                ref={registerInfiniteLoaderChild}
                                autoHeight
                                className={"List"}
                                height={height || 0}
                                width={width}
                                scrollTop={scrollTop}
                                isScrolling={isScrolling}
                                onScroll={onChildScroll}
                                overscanRowCount={2}
                                rowCount={list.size}
                                rowHeight={30}
                                rowRenderer={this.rowRenderer}
                                onRowsRendered={onRowsRendered}
                              />
                            </div>
                          )}
                        </AutoSizer>
                      </div>
                    )}
                  </WindowScroller>
                )}
              </InfiniteLoader>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
