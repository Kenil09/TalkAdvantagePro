import { useState, useCallback } from 'react'

type UseFormSubmitOptions<TFormData> = {
  onSubmit: (data: TFormData) => Promise<void>
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

function useFormSubmit<TFormData>({
  onSubmit,
  onSuccess,
  onError,
}: UseFormSubmitOptions<TFormData>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleSubmit = useCallback(
    async (formData: TFormData) => {
      setLoading(true)
      setError(null)
      try {
        await onSubmit(formData)
        onSuccess?.()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    },
    [onSubmit, onSuccess, onError],
  )

  return {
    handleSubmit,
    loading,
    error,
  }
}

export default useFormSubmit
