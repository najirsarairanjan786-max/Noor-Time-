export interface WordResult {
  expected: string;
  recognized?: string;
  matchStatus: 'correct' | 'missing' | 'extra' | 'wrong' | 'low_confidence';
  confidence: number; // 0 to 1
  issue?: string;
}

export interface TajweedResult {
  rule: string;
  status: 'verified_correct' | 'verified_issue' | 'not_verified';
  message?: string;
}

export interface RecitationAnalysis {
  words: WordResult[];
  tajweed: TajweedResult[];
  overallConfidence: number;
  accuracy: number;
}

// A service abstraction for advanced Quran recitation recognition.
// Currently uses browser Speech Recognition as a fallback but is architected
// to plug into a specialized backend AI model for real Tajweed/Makharij analysis.
export class RecitationRecognitionService {
  private recognition: any = null;
  private isRecording = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onErrorCallback?: (err: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ar-SA';

        this.recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (this.onResultCallback) {
            this.onResultCallback(finalTranscript || interimTranscript, !!finalTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };
      }
    }
  }

  startRecording(onResult: (text: string, isFinal: boolean) => void, onError: (err: string) => void) {
    if (!this.recognition) {
      onError("Speech recognition is not supported in this browser.");
      return;
    }
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    try {
      this.recognition.start();
      this.isRecording = true;
    } catch (e) {
      console.error(e);
      onError("Could not start microphone.");
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  // Simulates advanced alignment and confidence scoring using Levenshtein distance 
  // as a placeholder for a real AI alignment model.
  async alignWords(expectedText: string, recognizedText: string): Promise<WordResult[]> {
    const expectedWords = expectedText.replace(/[^\u0600-\u06FF\s]/g, '').split(/\s+/).filter(w => w);
    const recognizedWords = recognizedText.replace(/[^\u0600-\u06FF\s]/g, '').split(/\s+/).filter(w => w);

    const words: WordResult[] = [];
    
    // Simple mock alignment
    for (let i = 0; i < expectedWords.length; i++) {
      const exp = expectedWords[i];
      const rec = recognizedWords[i] || "";
      
      let matchStatus: WordResult['matchStatus'] = 'missing';
      let confidence = 0.0;
      let issue = undefined;

      if (!rec) {
        matchStatus = 'missing';
        confidence = 1.0; 
      } else if (exp === rec) {
        matchStatus = 'correct';
        confidence = 0.9 + (Math.random() * 0.1); // high confidence
      } else {
        // Mock a confidence calculation based on string similarity
        const distance = this.levenshtein(exp, rec);
        const maxLen = Math.max(exp.length, rec.length);
        const sim = 1 - (distance / maxLen);
        
        if (sim > 0.8) {
          matchStatus = 'correct'; // Treat minor variations (diacritics often ignored in basic speech to text) as correct for now
          confidence = 0.8;
          issue = "Possible harakah difference.";
        } else if (sim > 0.4) {
          matchStatus = 'wrong';
          confidence = 0.7;
          issue = "Pronunciation mismatch.";
        } else {
          matchStatus = 'low_confidence';
          confidence = 0.3;
          issue = "Unable to reliably determine.";
        }
      }

      words.push({
        expected: exp,
        recognized: rec,
        matchStatus,
        confidence,
        issue
      });
    }

    // Mark extra words
    for (let i = expectedWords.length; i < recognizedWords.length; i++) {
      words.push({
        expected: "",
        recognized: recognizedWords[i],
        matchStatus: 'extra',
        confidence: 0.8,
        issue: "Extra word detected."
      });
    }

    return words;
  }

  async analyzeTajweed(): Promise<TajweedResult[]> {
    // Currently, standard APIs do not support Tajweed analysis.
    // This stubs out the architecture for a future specialized model.
    return [
      { rule: "Madd", status: "not_verified", message: "Not automatically verified." },
      { rule: "Ghunnah", status: "not_verified", message: "Not automatically verified." },
      { rule: "Qalqalah", status: "not_verified", message: "Not automatically verified." },
      { rule: "Ikhfa", status: "not_verified", message: "Not automatically verified." }
    ];
  }

  async analyzeRecitation(expectedText: string, recognizedText: string): Promise<RecitationAnalysis> {
    const words = await this.alignWords(expectedText, recognizedText);
    const tajweed = await this.analyzeTajweed();
    
    let correctCount = 0;
    let totalConfidence = 0;
    let scorableWords = 0;

    words.forEach(w => {
      if (w.expected) scorableWords++;
      if (w.matchStatus === 'correct') correctCount++;
      totalConfidence += w.confidence;
    });

    const accuracy = scorableWords === 0 ? 0 : Math.round((correctCount / scorableWords) * 100);
    const overallConfidence = words.length === 0 ? 0 : Math.round((totalConfidence / words.length) * 100);

    return {
      words,
      tajweed,
      overallConfidence,
      accuracy
    };
  }

  private levenshtein(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
