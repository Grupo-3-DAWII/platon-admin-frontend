import { EMPTY, expand, Observable, reduce } from 'rxjs';
import { PageDto } from '../models/page';
export function allPages<T>(fetch: (page: number) => Observable<PageDto<T>>): Observable<T[]> {
  return fetch(0).pipe(
    expand((page) =>
      page.last || page.page + 1 >= page.totalPages ? EMPTY : fetch(page.page + 1),
    ),
    reduce((all, page) => all.concat(page.content), [] as T[]),
  );
}
