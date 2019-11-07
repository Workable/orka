export default function safeStringify(event) {
  try {
    return JSON.stringify(event);
  } catch (error) {
    let seen = new WeakSet();

    const circularJson = JSON.stringify(event, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return 'circular_ref';
        }
        seen.add(value);
      }
      return value;
    });

    seen = null;
    return circularJson;
  }
}
