const errorStatusMap: { [key: string]: number | undefined } = {
  AuthenticationError: 401,
  AuthorizationError: 403,
  NotFoundError: 404,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export function getErrorHttpStatus(error: any): number {
  if (!error || typeof error !== "object") {
    return 500;
  }

  const errorType = [error.status, error.code, error.name, error.type].find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => {
      return !!errorStatusMap[v];
    }
  );
  return errorStatusMap[errorType] ?? 500;
}
