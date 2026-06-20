import './legal-document.scss';
import { useRouter } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import {
  APP_DISPLAY_NAME,
  LEGAL_CONTACT_EMAIL,
  LEGAL_OPERATOR_NAME,
  loadLegalDocument,
  type LegalDocId,
  type LegalDocument,
} from '../../../legal';
import { ROUTES } from '../../../utils/route';
import { ScrollView, Text, View } from '@tarojs/components';
import { useI18n } from '@/hooks/useI18n';

const LegalDocumentPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const router = useRouter();
  const docId = router.params.doc as LegalDocId | undefined;
  const { locale, t } = useI18n();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void loadLegalDocument(docId, locale).then((loaded) => {
      if (!cancelled) {
        setDocument(loaded);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [docId, locale]);

  if (!docId || (!loading && !document)) {
    return (
      <View data-cmp="LegalDocument" className="s-legal-doc">
        <PageNavigation title={t('legal.docTitle')} fallback={ROUTES.PROFILE} />
        <View className="s-legal-doc__empty">
          <Text>{t('legal.docNotFound')}</Text>
        </View>
      </View>
    );
  }

  if (loading || !document) {
    return (
      <View data-cmp="LegalDocument" className="s-legal-doc">
        <PageNavigation title={t('legal.docTitle')} fallback={ROUTES.PROFILE} />
        <View className="s-legal-doc__empty">
          <Text>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View data-cmp="LegalDocument" className="s-legal-doc">
      <PageNavigation title={document.title} fallback={ROUTES.PROFILE} />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-legal-doc__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-legal-doc__main">
          <Text className="s-legal-doc__meta">
            {t('legal.meta', {
              app: APP_DISPLAY_NAME,
              date: document.updatedAt,
              version: document.version,
            })}
          </Text>
          {document.preamble ? (
            <Text className="s-legal-doc__preamble">{document.preamble}</Text>
          ) : null}
          {document.sections.map((section) => (
            <View key={section.title} className="s-legal-doc__section">
              <Text className="s-legal-doc__section-title">{section.title}</Text>
              {section.paragraphs.map((paragraph, idx) => (
                <Text key={idx} className="s-legal-doc__paragraph">
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
          <View className="s-legal-doc__footer">
            <Text className="s-legal-doc__footer-text">
              {t('legal.footerOperator', { name: LEGAL_OPERATOR_NAME })}
              {'\n'}
              {t('legal.footerContact', { email: LEGAL_CONTACT_EMAIL })}
              {'\n'}
              {t('legal.footerHelp')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalDocumentPage;
