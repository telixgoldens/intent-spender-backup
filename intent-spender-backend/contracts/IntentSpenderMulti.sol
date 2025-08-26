// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract IntentSpenderMulti {
    address public owner;

    event SpentETH(address indexed to, uint256 amount, string note);
    event SpentToken(address indexed token, address indexed to, uint256 amount, string note);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function executeIntentETH(address payable _to, uint256 _amount, string calldata _note) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient ETH balance");
        _to.transfer(_amount);
        emit SpentETH(_to, _amount, _note);
    }

    function executeIntentToken(address _token, address _to, uint256 _amount, string calldata _note) external onlyOwner {
        IERC20 token = IERC20(_token);
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        require(token.transfer(_to, _amount), "Transfer failed");
        emit SpentToken(_token, _to, _amount, _note);
    }

    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}
