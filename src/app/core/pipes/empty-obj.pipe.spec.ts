import { EmptyObjPipe } from './empty-obj.pipe';

describe('EmptyObjPipe', () => {
  it('create an instance', () => {
    const pipe = new EmptyObjPipe();
    expect(pipe).toBeTruthy();
  });
});
