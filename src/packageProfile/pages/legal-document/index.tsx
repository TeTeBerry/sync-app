import './legal-document.scss';
import { useRouter } from '@tarojs/taro';
import React, { useMemo } from 'react';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import {
  APP_DISPLAY_NAME,
  LEGAL_CONTACT_EMAIL,
  LEGAL_OPERATOR_NAME,
  getLegalDocument,
  type LegalDocId,
} from '../../../legal';
import { ROUTES } from '../../../utils/route';
import { ScrollView, Text, View } from '@tarojs/components';

const LegalDocumentPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const router = useRouter();
  const docId = router.params.doc as LegalDocId | undefined;

  const document = useMemo(() => getLegalDocument(docId), [docId]);

  if (!document) {
    return (
      <View data-cmp="LegalDocument" className="s-legal-doc">
        <PageNavigation title="文档" fallback={ROUTES.PROFILE} />
        <View className="s-legal-doc__empty">
          <Text>未找到该文档</Text>
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
            {APP_DISPLAY_NAME} · 更新日期：{document.updatedAt} · 版本{' '}
            {document.version}
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
              运营者：{LEGAL_OPERATOR_NAME}
              {'\n'}
              联系邮箱：{LEGAL_CONTACT_EMAIL}
              {'\n'}
              你可通过「设置 → 帮助与反馈」提交问题。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalDocumentPage;
