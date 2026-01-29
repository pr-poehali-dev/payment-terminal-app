import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type Screen = 'home' | 'amount' | 'payment' | 'scanning' | 'success';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');
  const [amount, setAmount] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [scanningText, setScanningText] = useState('Сканирование лица...');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    audioRef.current = audio;
  }, []);

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleNumberClick = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '' && num === '.') {
      setAmount('0.');
      return;
    }
    setAmount(prev => prev + num);
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount('');
  };

  const handleContinue = () => {
    if (amount && parseFloat(amount) > 0) {
      setScreen('payment');
    }
  };

  const handlePayment = () => {
    setScreen('scanning');
    setProgress(0);
    setScanningText('Сканирование лица...');
  };

  useEffect(() => {
    if (screen === 'scanning') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              playSuccessSound();
              setScreen('success');
              setTimeout(() => {
                setScreen('home');
                setAmount('');
                setProgress(0);
              }, 3000);
            }, 300);
            return 100;
          }
          
          if (prev === 30) setScanningText('Анализ черт лица...');
          if (prev === 60) setScanningText('Проверка безопасности...');
          if (prev === 90) setScanningText('Подтверждение оплаты...');
          
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [screen]);

  const handleCancel = () => {
    setScreen('home');
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {screen === 'home' && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 p-12">
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="RussianRuble" size={48} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Терминал оплаты
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Добро пожаловать
                  </p>
                </div>
                <div className="pt-8">
                  <Button
                    onClick={() => setScreen('amount')}
                    size="lg"
                    className="w-full max-w-md h-16 text-xl font-semibold bg-primary hover:bg-primary/90"
                  >
                    <Icon name="Plus" size={24} className="mr-2" />
                    Создать оплату
                  </Button>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-400">by @BortexChannel</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === 'amount' && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 p-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    Введите сумму
                  </h2>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="icon"
                  >
                    <Icon name="X" size={24} />
                  </Button>
                </div>

                <div className="bg-secondary rounded-xl p-6 min-h-[100px] flex items-center justify-center">
                  <div className="text-5xl font-bold text-foreground">
                    {amount || '0'} ₽
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
                    <Button
                      key={key}
                      onClick={() => {
                        if (key === '⌫') handleBackspace();
                        else handleNumberClick(key);
                      }}
                      variant="outline"
                      className="h-20 text-2xl font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      {key}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="lg"
                    className="h-14 text-lg"
                  >
                    Очистить
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!amount || parseFloat(amount) === 0}
                    size="lg"
                    className="h-14 text-lg bg-primary hover:bg-primary/90"
                  >
                    Продолжить
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === 'payment' && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 p-12">
              <div className="text-center space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="icon"
                  >
                    <Icon name="ArrowLeft" size={24} />
                  </Button>
                  <h2 className="text-2xl font-bold text-foreground">
                    Оплата
                  </h2>
                  <div className="w-10" />
                </div>

                <div className="bg-secondary rounded-xl p-8">
                  <p className="text-lg text-muted-foreground mb-2">К оплате</p>
                  <p className="text-6xl font-bold text-foreground">{amount} ₽</p>
                </div>

                <div className="flex justify-center pt-4">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="Scan" size={64} className="text-primary" />
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={handlePayment}
                    size="lg"
                    className="w-full max-w-md h-20 text-2xl font-semibold bg-primary hover:bg-primary/90"
                  >
                    <Icon name="Fingerprint" size={32} className="mr-3" />
                    Оплатить по лицу
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === 'scanning' && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 p-12">
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <Icon name="ScanFace" size={64} className="text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {scanningText}
                  </h2>
                  <div className="max-w-md mx-auto space-y-3">
                    <Progress value={progress} className="h-3" />
                    <p className="text-xl text-muted-foreground">
                      {progress}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === 'success' && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 p-12">
              <div className="text-center space-y-8">
                <div className="flex justify-center animate-pulse-success">
                  <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={72} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-green-500 mb-4">
                    Успешно!
                  </h1>
                  <p className="text-2xl text-muted-foreground">
                    Оплата {amount} ₽ прошла успешно
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}