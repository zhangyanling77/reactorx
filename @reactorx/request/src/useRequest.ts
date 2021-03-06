import { isEqual, noop } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import { Actor, IDispatch, useStore } from "@reactorx/core";
import { RequestActor } from "./RequestActor";
import { BehaviorSubject, merge as observableMerge, Subject } from "rxjs";
import { filter as rxFilter, tap as rxTap } from "rxjs/operators";

export interface IUseRequestOpts<TReq, TRespBody, TError> {
  arg?: RequestActor<TReq, TRespBody, TError>["arg"];
  opts?: RequestActor<TReq, TRespBody, TError>["opts"];
  required?: boolean;
  onSuccess?: (
    actor: RequestActor<TReq, TRespBody, TError>["done"],
    dispatch: IDispatch,
  ) => void;
  onFail?: (
    actor: RequestActor<TReq, TRespBody, TError>["failed"],
    dispatch: IDispatch,
  ) => void;
  onFinish?: (dispatch: IDispatch) => void;
}

export function useRequest<TReq, TRespBody, TError>(
  requestActor: RequestActor<TReq, TRespBody, TError>,
  options: IUseRequestOpts<TReq, TRespBody, TError> = {},
): [
  (
    arg: IUseRequestOpts<TReq, TRespBody, TError>["arg"],
    opts?: IUseRequestOpts<TReq, TRespBody, TError>["opts"],
  ) => void,
  BehaviorSubject<boolean>
] {
  const requesting$ = useMemo(
    () => new BehaviorSubject(!!options.required),
    [],
  );
  const lastArg = useRef(options.arg);
  const { actor$, dispatch } = useStore();
  const optionsRef = useRef(options);

  optionsRef.current = options;

  useEffect(
    () => {
      const subject$ = new Subject<Actor<any>>();

      const actorSubscription = actor$.subscribe(subject$);

      const end = (cb: () => void) => {
        cb();
        requesting$.next(false);
        (optionsRef.current.onFinish || noop)(dispatch);
      };

      const subscription = observableMerge(
        subject$.pipe(
          rxFilter(requestActor.done.is),
          rxFilter((actor) =>
            isEqual(actor.opts.parentActor.arg, lastArg.current),
          ),
          rxTap((actor: typeof requestActor.done) => {
            end(() => (optionsRef.current.onSuccess || noop)(actor, dispatch));
          }),
        ),
        subject$.pipe(
          rxFilter(requestActor.failed.is),
          rxFilter((actor) =>
            isEqual(actor.opts.parentActor.arg, lastArg.current),
          ),
          rxTap((actor: typeof requestActor.failed) => {
            end(() => (optionsRef.current.onFail || noop)(actor, dispatch));
            (optionsRef.current.onFail || noop)(actor, dispatch);
          }),
        ),
      ).subscribe();

      return () => {
        subscription.unsubscribe();
        actorSubscription.unsubscribe();
      };
    },
    [requestActor],
  );

  return [
    (
      arg: (typeof options)["arg"] = optionsRef.current.arg || ({} as any),
      opts: (typeof options)["opts"] = optionsRef.current.opts,
    ) => {
      lastArg.current = arg;
      requesting$.next(true);
      dispatch(requestActor.with(arg, opts));
    },
    requesting$,
  ];
}
