import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { resolvePersonalityAudioPlaybackSrc } from '../utils/personalityAudioPrefetch';
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
  const t = useT();
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const [playbackSrc, setPlaybackSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage('');
    setPlaybackSrc('');

    void resolvePersonalityAudioPlaybackSrc(assetKey).then((src) => {
      if (cancelled) return;
      setPlaybackSrc(src);
      if (!src) {
        setLoading(false);
        setErrorMessage(t('personality.audioNotUploaded'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [assetKey, t]);

  useEffect(() => {
    if (!playbackSrc || process.env.TARO_ENV === 'h5') {
      if (playbackSrc && process.env.TARO_ENV === 'h5') {
        setLoading(false);
      }
      return undefined;
    }

    const audio = Taro.createInnerAudioContext();
    audioRef.current = audio;
    audio.src = playbackSrc;
    audio.autoplay = false;
    audio.obeyMuteSwitch = false;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onStop = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onCanplay = () => setLoading(false);
    const onError = () => {
      setPlaying(false);
      setLoading(false);
      setErrorMessage(t('personality.audioPlaybackFailed'));
    };

    audio.onPlay(onPlay);
    audio.onPause(onPause);
    audio.onStop(onStop);
    audio.onEnded(onEnded);
    audio.onCanplay(onCanplay);
    audio.onError(onError);

    return () => {
      audio.offPlay(onPlay);
      audio.offPause(onPause);
      audio.offStop(onStop);
      audio.offEnded(onEnded);
      audio.offCanplay(onCanplay);
      audio.offError(onError);
      audio.destroy();
      audioRef.current = null;
    };
  }, [playbackSrc, t]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !playbackSrc) {
      void Taro.showToast({ title: t('personality.audioUnavailable'), icon: 'none' });
      return;
    }
    if (playing) {
      audio.pause();
      return;
    }
    audio.play();
  }, [playbackSrc, playing, t]);

  const audioTitle = loading
    ? t('personality.audioLoading')
    : playing
      ? t('personality.audioPlaying')
      : t('personality.audioPlayClip');

  return (
    <View className="s-personality-quiz__audio">
      <Button
        className={[
          's-personality-quiz__audio-btn',
          playing && 's-personality-quiz__audio-btn--playing',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled || loading || !playbackSrc}
        onClick={togglePlayback}
      >
        <Text className="s-personality-quiz__audio-icon" aria-hidden>
          {playing ? '⏸' : '▶️'}
        </Text>
        <View className="s-personality-quiz__audio-copy">
          <Text className="s-personality-quiz__audio-title">{audioTitle}</Text>
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
