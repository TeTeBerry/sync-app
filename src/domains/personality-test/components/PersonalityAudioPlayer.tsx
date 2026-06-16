import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { Button } from '@/components/ui';
import { resolvePersonalityMediaUrl } from '../utils/resolvePersonalityMedia';
import { Text, View } from '@tarojs/components';

type PersonalityAudioPlayerProps = {
  assetKey: string;
  caption?: string;
  disabled?: boolean;
};

export const PersonalityAudioPlayer: FC<PersonalityAudioPlayerProps> = ({
  assetKey,
  caption,
  disabled = false,
}) => {
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage('');
    void resolvePersonalityMediaUrl(assetKey).then((url) => {
      if (cancelled) return;
      setMediaUrl(url);
      setLoading(false);
      if (!url) {
        setErrorMessage('音频暂未上传，请稍后再试');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [assetKey]);

  useEffect(() => {
    if (!mediaUrl || process.env.TARO_ENV === 'h5') {
      return undefined;
    }

    const audio = Taro.createInnerAudioContext();
    audioRef.current = audio;
    audio.src = mediaUrl;
    audio.autoplay = false;
    audio.obeyMuteSwitch = false;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onStop = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => {
      setPlaying(false);
      setErrorMessage('音频播放失败');
    };

    audio.onPlay(onPlay);
    audio.onPause(onPause);
    audio.onStop(onStop);
    audio.onEnded(onEnded);
    audio.onError(onError);

    return () => {
      audio.offPlay(onPlay);
      audio.offPause(onPause);
      audio.offStop(onStop);
      audio.offEnded(onEnded);
      audio.offError(onError);
      audio.destroy();
      audioRef.current = null;
    };
  }, [mediaUrl]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !mediaUrl) {
      void Taro.showToast({ title: '音频暂不可用', icon: 'none' });
      return;
    }
    if (playing) {
      audio.pause();
      return;
    }
    audio.play();
  }, [mediaUrl, playing]);

  return (
    <View className="s-personality-quiz__audio">
      <Button
        className={[
          's-personality-quiz__audio-btn',
          playing && 's-personality-quiz__audio-btn--playing',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled || loading || !mediaUrl}
        onClick={togglePlayback}
      >
        <Text className="s-personality-quiz__audio-icon" aria-hidden>
          {playing ? '⏸' : '▶️'}
        </Text>
        <View className="s-personality-quiz__audio-copy">
          <Text className="s-personality-quiz__audio-title">
            {loading ? '加载音频…' : playing ? '播放中' : '播放片段'}
          </Text>
          {caption ? (
            <Text className="s-personality-quiz__audio-caption">{caption}</Text>
          ) : null}
        </View>
      </Button>
      {errorMessage ? (
        <Text className="s-personality-quiz__media-hint">{errorMessage}</Text>
      ) : null}
    </View>
  );
};
