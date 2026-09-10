import styled, { css } from 'styled-components/native';

import { colors, fonts } from '../../styles';
import { iPhoneHelper } from '../../utils';
import { RegularText } from '../../components';

interface MenuItemProps {
  selected: boolean;
}

export const Container = styled.View`
  flex: 1;
  background: ${colors.white};
  padding-bottom: 20px;
`;

export const Header = styled.View`
  width: 100%;
  background: ${colors.white};
`;

export const StoreBanner = styled.Image`
  width: 100%;
  height: 180px;
`;

export const HeaderContent = styled.View`
  padding: 20px 5% 16px;
  align-items: flex-start;
`;

export const Separator = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${colors.lightGray};
  margin: 14px 0;
`;

export const Title = styled(RegularText)`
  margin-bottom: 6px;
  font-size: ${fonts.EXTRA_BIG}px;
  font-weight: bold;
  color: #1f2933;
`;

export const SubTitle = styled(RegularText)`
  font-size: ${fonts.SMALL}px;
  line-height: 20px;
  color: ${colors.gray};
`;

export const StoreRA = styled(RegularText)`
  color: ${colors.gray};
  font-size: ${fonts.SMALL}px;
  margin-top: 2px;
`;

export const Content = styled.View`
  flex: 1;
  margin-bottom: ${iPhoneHelper.getBottomSpace()}px;
  padding: 12px 5% 0;
`;

export const BackHeaderContainer = styled.View`
  padding-top: ${iPhoneHelper.getStatusBarHeight(false) + 8}px;
  padding-left: 12px;
  padding-bottom: 8px;
  background: ${colors.white};
  z-index: 10;
`;

export const Touchable = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})``;

export const ContainerItem = styled.View<MenuItemProps>`
  ${props =>
    props.selected &&
    css`
      border-bottom-width: 2px;
      border-bottom-color: ${colors.primary};
    `}
`;

export const MenuItem = styled.Text<MenuItemProps>`
  font-size: ${fonts.MEDIUM}px;
  margin: 0px 15px 12px;
  color: ${props => (props.selected ? colors.primary : '#000')};
`;

export const TitleContainer = styled.View`
  border-top-width: 0.5px;
  border-top-color: ${colors.lightGray};
  margin-top: 6px;
`;

export const TitleMenu = styled.Text`
  font-size: ${fonts.MEDIUM}px;
  font-weight: bold;
  margin: 18px 0px 12px;
`;

export const IconView = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  margin-left: 8px;
`;
