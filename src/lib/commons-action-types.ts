export interface CommonsActionState {
  error?: string;
  success?: string;
}

export type CommonsFormAction = (
  previousState: CommonsActionState,
  formData: FormData,
) => Promise<CommonsActionState>;
