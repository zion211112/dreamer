export const lovableErrorReporting = {
  reportError: (err) => {
    console.error('Lovable error:', err)
    // Report to Lovable if available
    if (window?.lovable?.report) {
      window.lovable.report(err)
    }
  }
}