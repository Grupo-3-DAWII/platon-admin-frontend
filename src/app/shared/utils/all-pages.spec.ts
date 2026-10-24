import { of, throwError } from 'rxjs';
import { allPages } from './all-pages';
import { PageDto } from '../models/page';
describe('Complete paginated lists', () => {
  it('loads each page before exposing a complete collection', () => {
    const fetch = vi.fn((page: number) =>
      of({
        content: [page + 1],
        page,
        size: 1,
        totalElements: 3,
        totalPages: 3,
        first: page === 0,
        last: page === 2,
      } satisfies PageDto<number>),
    );
    const next = vi.fn();
    allPages(fetch).subscribe(next);
    expect(fetch.mock.calls.map((args) => args[0])).toEqual([0, 1, 2]);
    expect(next).toHaveBeenCalledExactlyOnceWith([1, 2, 3]);
  });
  it('fails the whole list if a later page fails, instead of publishing incomplete totals', () => {
    const fetch = vi.fn((page: number) =>
      page === 0
        ? of({
            content: [1],
            page,
            size: 1,
            totalElements: 2,
            totalPages: 2,
            first: true,
            last: false,
          })
        : throwError(() => new Error('offline')),
    );
    const next = vi.fn();
    const error = vi.fn();
    allPages(fetch).subscribe({ next, error });
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
  });
});
