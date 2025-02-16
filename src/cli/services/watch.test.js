const chokidar = require('chokidar');
const watchService = require('./watch');

describe('Watch Service', () => {
  function buildWatcherInstanceMock(){
    return { on: jest.fn(), close: jest.fn() };
  }

  function stubWatch(watcherInstance){
    chokidar.watch = jest.fn(() => watcherInstance);
  }

  function simulateChangingFileOnce(watcher){
    let changeExecutions = 0;
    stubWatch(watcher);
    watcher.on = jest.fn((evt, callback) => {
      if(changeExecutions === 0) {
        ++changeExecutions;
        callback();
      }
    });
  }

  beforeEach(() => {
    stubWatch(buildWatcherInstanceMock());
    console.log = jest.fn();
  });

  it('should watch files', () => {
    const watcher = buildWatcherInstanceMock();
    const files = ['some/path/to/file', 'some/path/to/dir'];
    const onChange = jest.fn();
    stubWatch(watcher);
    watchService.init(files, onChange);
    expect(chokidar.watch).toHaveBeenCalledWith(files);
    expect(watcher.on.mock.calls[0][0]).toEqual('change');
    expect(typeof watcher.on.mock.calls[0][1]).toEqual('function');
  });

  it('should log files watch', () => {
    watchService.init('some/file.js', jest.fn());
    expect(console.log).toHaveBeenCalledWith('Watching for changes...');
  });

  it('should log changed file on file change', () => {
    const watcher = buildWatcherInstanceMock();
    const fileChanged = 'file.js';
    const onChange = jest.fn(() => {
      return { then: jest.fn() };
    });
    watcher.on = jest.fn((evt, callback) => callback(fileChanged));
    stubWatch(watcher);
    watchService.init('some/path/to/file', onChange);
    expect(console.log).toHaveBeenCalledWith(`${fileChanged} changed!`);
  });

  it('should re-watch files on file change', () => {
    const watcher = buildWatcherInstanceMock();
    simulateChangingFileOnce(watcher);
    watchService.init('some/path/to/file', jest.fn());
    expect(watcher.on.mock.calls.length).toEqual(2);
    expect(watcher.close.mock.calls.length).toEqual(1);
  });

  it('should re-watch files on file change when change callback returns a promise', () => {
    const onChange = jest.fn(() => {
      return { then: jest.fn(successCallback => successCallback()) };
    });
    const watcher = buildWatcherInstanceMock();
    simulateChangingFileOnce(watcher);
    watchService.init('some/path/to/file', onChange);
    expect(watcher.on.mock.calls.length).toEqual(2);
    expect(watcher.close.mock.calls.length).toEqual(1);
  });
});
