import numpy as np
import scipy.io
import scipy.signal

class EEGPreprocessor:
    def __init__(self, sampling_rate=128):
        self.sampling_rate = sampling_rate
        self.band_frequencies = {
            'delta': (1, 4),
            'theta': (4, 8),
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 45)
        }

    def load_mat_file(self, file_path):
        """Loads DEAP dataset .mat file."""
        try:
            data = scipy.io.loadmat(file_path)
            # DEAP Format: data['data'] -> (trials, channels, samples)
            # Labels: data['labels'] -> (trials, 4) [valence, arousal, dominance, liking]
            return data['data'], data['labels']
        except Exception as e:
            print(f"Error loading file: {e}")
            return None, None

    def temporal_filtering(self, eeg_data, order=4):
        """Filters EEG data using bandpass filters."""
        # Assume eeg_data is (trials, channels, time)
        filtered_data = {}
        nyq = 0.5 * self.sampling_rate
        
        for band, (low, high) in self.band_frequencies.items():
            low = low / nyq
            high = high / nyq
            b, a = scipy.signal.butter(order, [low, high], btype='band')
            filtered_data[band] = scipy.signal.filtfilt(b, a, eeg_data, axis=-1)
            
        return filtered_data

    def segment_data(self, data, window_size=128, stride=64):
        """Segments continuous EEG data into windows."""
        # Implement overlapping windowing
        # data: (trials, channels, time)
        segments = []
        labels = [] # This would need labels passed in
        # Simplified for demonstration
        n_samples = data.shape[2]
        for start in range(0, n_samples - window_size, stride):
            end = start + window_size
            segments.append(data[:, :, start:end])
        return np.array(segments)

    def extract_features(self, filtered_data):
        """Extracts simple features like power spectral density or mean energy."""
        features = []
        for band, signal in filtered_data.items():
            # Example: Mean absolute value per channel
            band_energy = np.mean(np.abs(signal), axis=-1) 
            features.append(band_energy)
        
        # Stack features: (trials, channels * bands)
        features = np.stack(features, axis=-1).reshape(filtered_data[list(filtered_data.keys())[0]].shape[0], -1)
        return features

    def process_trial(self, trial_data):
        """Process a single trial's raw data.""" 
        # trial_data: (channels, samples)
        # Apply filtering
        filtered = self.temporal_filtering(trial_data[np.newaxis, ...])
        # Extract features (or pass filtered data directly if using raw waveforms)
        processed = self.extract_features(filtered)
        return processed

# Placeholder for real DEAP dataset loading logic
def load_mock_data():
    """Generates mock EEG data for testing."""
    # 40 trials, 32 channels, 8064 samples (63s * 128Hz)
    mock_data = np.random.randn(40, 32, 8064)
    # valence, arousal usually 1-9
    mock_labels = np.random.randint(1, 10, (40, 4))
    return mock_data, mock_labels
