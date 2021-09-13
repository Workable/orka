exports['Test worker initialize sets progress runs initializeCB updates state then executeCB and updates state 1'] = [
  [
    "Starting worker "
  ],
  [
    "Worker initialized."
  ],
  [
    "Worker starting processing"
  ],
  [
    "Worker finished processing."
  ]
]

exports['Test worker document already exists in db runs initializeCB updates state then executeCB and updates state 1'] = [
  [
    "Starting worker "
  ],
  [
    "Worker initialized."
  ],
  [
    "Worker starting processing"
  ],
  [
    "Worker finished processing."
  ]
]

exports['Test worker worker is already initialized runs executeCB and updates state 1'] = [
  [
    "Starting worker "
  ],
  [
    "Worker starting processing"
  ],
  [
    "Worker finished processing."
  ]
]

exports['Test worker worker throws error runs executeCB and updates state and reruns start after delay 1'] = [
  [
    "Starting worker "
  ],
  [
    "Worker starting processing"
  ]
]

exports['Test worker worker throws error runs executeCB and updates state and reruns start after delay 2'] = [
  [
    {},
    "Errored will retry in  0.01 secs"
  ]
]

exports['Test worker worker is already finished will retry start after delay 1'] = [
  [
    "Starting worker "
  ],
  [
    "Worker finished processing. Will check again in 0.00016666666666666666 minutes"
  ]
]
