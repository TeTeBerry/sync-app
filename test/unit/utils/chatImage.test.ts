import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isLocalImageFileRef, uploadChatImageRefs } from '@/utils/chatImage';
import { uploadImageFile } from '@/utils/uploadImage';

const cosUrl =
  'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/demo-user/1.jpg';

vi.mock('@/utils/uploadImage', () => ({
  uploadImageFile: vi.fn(async () => cosUrl),
}));

describe('isLocalImageFileRef', () => {
  it('recognizes WeChat device and devtools temp paths', () => {
    expect(isLocalImageFileRef('wxfile://tmp_abc.jpg')).toBe(true);
    expect(
      isLocalImageFileRef(
        'http://tmp/wxfb0ad0f51a836ae1.o6zAJs7t7QmyBKCtv7q9mCnkl77Y.png',
      ),
    ).toBe(true);
    expect(isLocalImageFileRef('http://usr/saved.png')).toBe(true);
  });

  it('does not treat real remote URLs as local', () => {
    expect(isLocalImageFileRef('http://127.0.0.1:3000/uploads/a.jpg')).toBe(false);
    expect(isLocalImageFileRef('https://evil.example.com/uploads/x.jpg')).toBe(false);
  });
});

describe('uploadChatImageRefs', () => {
  beforeEach(() => {
    vi.mocked(uploadImageFile).mockClear();
  });

  it('uploads WeChat devtools http://tmp paths via COS + verify', async () => {
    const localPath = 'http://tmp/wxfoo.png';
    const urls = await uploadChatImageRefs([localPath]);

    expect(uploadImageFile).toHaveBeenCalledWith(localPath);
    expect(urls).toEqual([cosUrl]);
  });

  it('uploads wxfile paths on device', async () => {
    const localPath = 'wxfile://tmp_abc.jpg';
    await uploadChatImageRefs([localPath]);
    expect(uploadImageFile).toHaveBeenCalledWith(localPath);
  });

  it('passes through trusted COS upload URLs', async () => {
    const trusted = cosUrl;
    const urls = await uploadChatImageRefs([trusted]);
    expect(urls).toEqual([trusted]);
    expect(uploadImageFile).not.toHaveBeenCalled();
  });

  it('rejects data URLs', async () => {
    await expect(uploadChatImageRefs(['data:image/jpeg;base64,abc'])).rejects.toThrow(
      '图片须先通过上传接口提交',
    );
  });

  it('rejects untrusted remote URLs', async () => {
    await expect(
      uploadChatImageRefs(['https://evil.example.com/uploads/x.jpg']),
    ).rejects.toThrow('图片须先通过上传接口提交');
  });
});
